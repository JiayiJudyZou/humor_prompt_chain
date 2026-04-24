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
  technicalDetails?: string;
};

const HUMOR_FLAVOR_WRITTEN_INCORRECTLY_ERROR =
  "This humor flavor is written incorrectly, so it could not generate captions. Please check the steps in this humor flavor and try again.";
const HUMOR_FLAVOR_STEP_SETUP_WRONG_ERROR =
  "This humor flavor is written incorrectly, so it could not generate captions. Please check the steps in this humor flavor and try again.";
const HUMOR_FLAVOR_SETUP_PROBLEM_ERROR =
  "This humor flavor is written incorrectly, so it could not generate captions. Please check the steps in this humor flavor and try again.";
const GENERIC_GENERATION_ERROR =
  "Something went wrong while generating captions. Please try again.";

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
    ...(input.technicalDetails
      ? { technicalDetails: input.technicalDetails }
      : {}),
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

function normalizeRunnerError(error: unknown): {
  userMessage: string;
  rawMessage: string;
} {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unexpected server error";

  const normalized = rawMessage.toLowerCase();

  const hasMissingStepOutput =
    normalized.includes("no output found for step") ||
    normalized.includes("missing prior output");

  const hasStepConfigurationSignal =
    hasMissingStepOutput ||
    normalized.includes("cannot read properties of undefined") ||
    normalized.includes("reading 'specificationversion'") ||
    normalized.includes('reading "specificationversion"') ||
    ((normalized.includes("502") || normalized.includes("bad gateway")) &&
      normalized.includes("/pipeline/generate-captions"));

  if (!hasStepConfigurationSignal) {
    return {
      userMessage: GENERIC_GENERATION_ERROR,
      rawMessage,
    };
  }

  if (hasMissingStepOutput) {
    return {
      userMessage: HUMOR_FLAVOR_STEP_SETUP_WRONG_ERROR,
      rawMessage,
    };
  }

  if (
    normalized.includes("cannot read properties of undefined") ||
    normalized.includes("reading 'specificationversion'") ||
    normalized.includes('reading "specificationversion"')
  ) {
    return {
      userMessage: HUMOR_FLAVOR_WRITTEN_INCORRECTLY_ERROR,
      rawMessage,
    };
  }

  return {
    userMessage: HUMOR_FLAVOR_SETUP_PROBLEM_ERROR,
    rawMessage,
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
          error: "Please sign in again to run this humor flavor test.",
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
          error: "You do not have access to run this humor flavor test.",
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
          error: "Please sign in again to run this humor flavor test.",
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
          error: "The test request was not formatted correctly. Please try again.",
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
            "Please choose a humor flavor and provide an image URL or image file.",
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
          error: "This humor flavor could not be found.",
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
    const { userMessage, rawMessage } = normalizeRunnerError(error);
    console.error("Humor flavor test runner failed", {
      selectedFlavorId,
      imageId,
      usedImageUrl,
      usedUploadedFile,
      rawError: rawMessage,
      normalizedError: userMessage,
    });

    return NextResponse.json(
      buildResponse({
        success: false,
        humorFlavorId: selectedFlavorId,
        imageId,
        captions: [],
        rawApiResponse: null,
        error: userMessage,
        technicalDetails: rawMessage,
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
