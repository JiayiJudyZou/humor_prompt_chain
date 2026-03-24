import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateCaptionsForFlavor,
  generatePresignedUrl,
  registerImageUrl,
  uploadFileToPresignedUrl,
} from "@/lib/api/captionPipeline";

type TestHumorFlavorRequest = {
  humorFlavorId: number;
  imageUrl?: string;
  imageFile?: File | null;
};

type TestHumorFlavorResponse = {
  success: boolean;
  humorFlavorId: number | null;
  imageId: string | null;
  captions: unknown[];
  rawApiResponse: unknown;
  debug: {
    usedImageUrl: string | null;
    usedUploadedFile: boolean;
    selectedFlavorId: number | null;
  };
  error?: string;
};

function extractCaptions(rawApiResponse: unknown): unknown[] {
  if (Array.isArray(rawApiResponse)) {
    return rawApiResponse;
  }

  if (rawApiResponse && typeof rawApiResponse === "object") {
    const record = rawApiResponse as Record<string, unknown>;

    if (Array.isArray(record.captions)) {
      return record.captions;
    }

    if (record.data && typeof record.data === "object") {
      const dataRecord = record.data as Record<string, unknown>;
      if (Array.isArray(dataRecord.captions)) {
        return dataRecord.captions;
      }
    }
  }

  return [];
}

function buildResponse(
  input: TestHumorFlavorResponse
): TestHumorFlavorResponse {
  return {
    success: input.success,
    humorFlavorId: input.humorFlavorId ?? null,
    imageId: input.imageId ?? null,
    captions: input.captions ?? [],
    rawApiResponse: input.rawApiResponse ?? null,
    debug: input.debug,
    ...(input.error ? { error: input.error } : {}),
  };
}

function parseRequestFormData(formData: FormData): TestHumorFlavorRequest | null {
  const humorFlavorIdValue = formData.get("humorFlavorId");
  const imageUrlValue = formData.get("imageUrl");
  const imageFileValue = formData.get("imageFile");

  const humorFlavorId =
    typeof humorFlavorIdValue === "string"
      ? Number.parseInt(humorFlavorIdValue, 10)
      : NaN;

  if (!Number.isInteger(humorFlavorId) || humorFlavorId <= 0) {
    return null;
  }

  const imageUrl = typeof imageUrlValue === "string" ? imageUrlValue.trim() : "";
  const imageFile =
    imageFileValue instanceof File && imageFileValue.size > 0
      ? imageFileValue
      : null;

  if (!imageUrl && !imageFile) {
    return null;
  }

  if (imageFile) {
    return {
      humorFlavorId,
      imageUrl: "",
      imageFile,
    };
  }

  return {
    humorFlavorId,
    imageUrl,
    imageFile: null,
  };
}

export async function POST(request: Request) {
  let selectedFlavorId: number | null = null;
  let imageId: string | null = null;
  let usedImageUrl: string | null = null;
  let usedUploadedFile = false;

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        buildResponse({
          success: false,
          humorFlavorId: null,
          imageId: null,
          captions: [],
          rawApiResponse: null,
          error: "Unauthorized",
          debug: {
            usedImageUrl,
            usedUploadedFile,
            selectedFlavorId,
          },
        }),
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_superadmin, is_matrix_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (
      profileError ||
      !profile ||
      (!profile.is_superadmin && !profile.is_matrix_admin)
    ) {
      return NextResponse.json(
        buildResponse({
          success: false,
          humorFlavorId: null,
          imageId: null,
          captions: [],
          rawApiResponse: null,
          error: "Forbidden",
          debug: {
            usedImageUrl,
            usedUploadedFile,
            selectedFlavorId,
          },
        }),
        { status: 403 }
      );
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;

    if (sessionError || !accessToken) {
      return NextResponse.json(
        buildResponse({
          success: false,
          humorFlavorId: null,
          imageId: null,
          captions: [],
          rawApiResponse: null,
          error: "Unauthorized",
          debug: {
            usedImageUrl,
            usedUploadedFile,
            selectedFlavorId,
          },
        }),
        { status: 401 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        buildResponse({
          success: false,
          humorFlavorId: null,
          imageId: null,
          captions: [],
          rawApiResponse: null,
          error: "Invalid form data body",
          debug: {
            usedImageUrl,
            usedUploadedFile,
            selectedFlavorId,
          },
        }),
        { status: 400 }
      );
    }

    const payload = parseRequestFormData(formData);

    if (!payload) {
      return NextResponse.json(
        buildResponse({
          success: false,
          humorFlavorId: null,
          imageId: null,
          captions: [],
          rawApiResponse: null,
          error:
            "Invalid payload. Expected form data with humorFlavorId and either imageUrl or imageFile.",
          debug: {
            usedImageUrl,
            usedUploadedFile,
            selectedFlavorId,
          },
        }),
        { status: 400 }
      );
    }

    selectedFlavorId = payload.humorFlavorId;
    usedUploadedFile = Boolean(payload.imageFile);
    usedImageUrl = payload.imageFile ? null : payload.imageUrl ?? null;

    const { data: flavor, error: flavorError } = await supabase
      .from("humor_flavors")
      .select("id")
      .eq("id", payload.humorFlavorId)
      .single();

    if (flavorError || !flavor) {
      return NextResponse.json(
        buildResponse({
          success: false,
          humorFlavorId: selectedFlavorId,
          imageId: null,
          captions: [],
          rawApiResponse: null,
          error: "Humor flavor not found",
          debug: {
            usedImageUrl,
            usedUploadedFile,
            selectedFlavorId,
          },
        }),
        { status: 404 }
      );
    }

    let registeredImageId: string;

    if (payload.imageFile) {
      const { presignedUrl, cdnUrl } = await generatePresignedUrl({
        contentType: payload.imageFile.type || "application/octet-stream",
        accessToken,
      });

      await uploadFileToPresignedUrl({
        presignedUrl,
        file: payload.imageFile,
      });

      const registerResponse = await registerImageUrl({
        imageUrl: cdnUrl,
        accessToken,
      });

      registeredImageId = registerResponse.imageId;
    } else {
      const registerResponse = await registerImageUrl({
        imageUrl: payload.imageUrl ?? "",
        accessToken,
      });

      registeredImageId = registerResponse.imageId;
    }

    if (
      typeof registeredImageId !== "string" ||
      registeredImageId.trim().length === 0
    ) {
      throw new Error(
        "Cannot generate captions: missing valid imageId after image registration."
      );
    }

    imageId = registeredImageId;

    if (
      typeof payload.humorFlavorId !== "number" ||
      !Number.isFinite(payload.humorFlavorId)
    ) {
      throw new Error(
        "Cannot generate captions: missing or invalid humorFlavorId."
      );
    }

    const apiResponse = await generateCaptionsForFlavor({
      imageId,
      humorFlavorId: payload.humorFlavorId,
      accessToken,
    });

    return NextResponse.json(
      buildResponse({
        success: true,
        humorFlavorId: payload.humorFlavorId,
        imageId,
        captions: extractCaptions(apiResponse),
        rawApiResponse: apiResponse,
        debug: {
          usedImageUrl,
          usedUploadedFile,
          selectedFlavorId,
        },
      })
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json(
      buildResponse({
        success: false,
        humorFlavorId: selectedFlavorId,
        imageId,
        captions: [],
        rawApiResponse: null,
        error: message,
        debug: {
          usedImageUrl,
          usedUploadedFile,
          selectedFlavorId,
        },
      }),
      { status: 500 }
    );
  }
}