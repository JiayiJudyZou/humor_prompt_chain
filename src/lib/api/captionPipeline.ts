import { createClient } from "@/lib/supabase/client";

const CAPTION_API_BASE_URL = "https://api.almostcrackd.ai";

type GeneratePresignedUrlParams = {
  contentType: string;
  accessToken?: string;
};

type GeneratePresignedUrlResponse = {
  presignedUrl: string;
  cdnUrl: string;
};

type UploadFileToPresignedUrlParams = {
  presignedUrl: string;
  file: File;
};

type RegisterImageUrlParams = {
  imageUrl: string;
  accessToken?: string;
};

type RegisterImageUrlResponse = {
  imageId: string;
};

type GenerateCaptionsForFlavorParams = {
  imageId: string;
  humorFlavorId: number;
  accessToken?: string;
};

async function getAccessToken(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Failed to get authenticated session: ${error.message}`);
  }

  const token = session?.access_token;
  if (!token) {
    throw new Error("User is not authenticated.");
  }

  return token;
}

async function parseErrorResponse(response: Response, fallbackMessage: string): Promise<string> {
  const bodyText = await response.text();
  return `${fallbackMessage}: ${response.status} ${response.statusText} | body: ${bodyText}`;
}

function buildCaptionApiError(endpoint: string, response: Response, rawBody: string): Error {
  return new Error(
    `Caption API request failed for ${endpoint}: ${response.status} ${response.statusText} | body: ${rawBody}`,
  );
}

async function captionApiFetch<T>(
  path: string,
  body: unknown,
  accessToken?: string,
): Promise<T> {
  const bearerToken = accessToken ?? (await getAccessToken());

  const response = await fetch(`${CAPTION_API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const rawBody = await response.text();
    throw buildCaptionApiError(path, response, rawBody);
  }

  return (await response.json()) as T;
}

export async function generatePresignedUrl({
  contentType,
  accessToken,
}: GeneratePresignedUrlParams): Promise<GeneratePresignedUrlResponse> {
  if (!contentType.trim()) {
    throw new Error("contentType is required.");
  }

  return captionApiFetch<GeneratePresignedUrlResponse>(
    "/pipeline/generate-presigned-url",
    { contentType },
    accessToken,
  );
}

export async function uploadFileToPresignedUrl({
  presignedUrl,
  file,
}: UploadFileToPresignedUrlParams): Promise<void> {
  if (!presignedUrl.trim()) {
    throw new Error("presignedUrl is required.");
  }

  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorResponse(response, "Failed to upload file to presigned URL"),
    );
  }
}

export async function registerImageUrl({
  imageUrl,
  accessToken,
}: RegisterImageUrlParams): Promise<RegisterImageUrlResponse> {
  if (!imageUrl.trim()) {
    throw new Error("imageUrl is required.");
  }

  return captionApiFetch<RegisterImageUrlResponse>(
    "/pipeline/upload-image-from-url",
    {
      imageUrl,
      isCommonUse: false,
    },
    accessToken,
  );
}

export async function generateCaptionsForFlavor({
  imageId,
  humorFlavorId,
  accessToken,
}: GenerateCaptionsForFlavorParams): Promise<unknown> {
  const normalizedImageId = imageId.trim();
  if (!normalizedImageId) {
    throw new Error("imageId is required.");
  }

  if (!Number.isFinite(humorFlavorId)) {
    throw new Error("humorFlavorId must be a valid number.");
  }

  const bearerToken = accessToken ?? (await getAccessToken());
  const response = await fetch(`${CAPTION_API_BASE_URL}/pipeline/generate-captions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageId: normalizedImageId,
      humorFlavorId,
    }),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw buildCaptionApiError("/pipeline/generate-captions", response, rawBody);
  }

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

export type {
  GenerateCaptionsForFlavorParams,
  GeneratePresignedUrlParams,
  GeneratePresignedUrlResponse,
  RegisterImageUrlParams,
  RegisterImageUrlResponse,
  UploadFileToPresignedUrlParams,
};
