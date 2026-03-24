type RunSingleStepInput = {
  imageUrl?: string;
  imageFile?: File | null;
  systemPrompt: string;
  userPrompt: string;
  model: string;
  temperature?: number | null;
  llm_input_type_id: number;
  llm_output_type_id: number;
};

const IMAGE_AND_TEXT_INPUT_TYPE_ID = 1;
const ARRAY_OUTPUT_TYPE_ID = 2;

function parseArrayOutput(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item.trim() : String(item).trim()))
        .filter(Boolean);
    }
  } catch {
    // Fall through to line parsing.
  }

  return trimmed
    .split("\n")
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);
}

function extractResponseText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const data = payload as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: unknown;
      }>;
    }>;
  };

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const chunks =
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((contentItem) => {
        if (contentItem?.type !== "output_text") return "";
        return typeof contentItem.text === "string" ? contentItem.text : "";
      })
      .filter(Boolean) ?? [];

  return chunks.join("\n").trim();
}

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

export async function runSingleStep({
  imageUrl,
  imageFile,
  systemPrompt,
  userPrompt,
  model,
  temperature,
  llm_input_type_id,
  llm_output_type_id,
}: RunSingleStepInput): Promise<string | string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const systemText = systemPrompt.trim() || "No system prompt provided.";
  const userText = userPrompt.trim() || "No user prompt provided.";
  const userContent: Array<Record<string, string>> = [
    { type: "input_text", text: userText },
  ];

  if (llm_input_type_id === IMAGE_AND_TEXT_INPUT_TYPE_ID) {
    if (imageFile) {
      const dataUrl = await fileToDataUrl(imageFile);
      userContent.push({ type: "input_image", image_url: dataUrl });
    } else if (imageUrl?.trim()) {
      userContent.push({ type: "input_image", image_url: imageUrl.trim() });
    } else {
      throw new Error("Image input is required for image+text steps.");
    }
  }

  const body: Record<string, unknown> = {
    model,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemText }],
      },
      {
        role: "user",
        content: userContent,
      },
    ],
  };

  if (typeof temperature === "number") {
    body.temperature = temperature;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof (payload as { error?: { message?: unknown } }).error?.message === "string"
        ? (payload as { error: { message: string } }).error.message
        : "Failed to run step.";
    throw new Error(message);
  }

  const textOutput = extractResponseText(payload);

  if (llm_output_type_id === ARRAY_OUTPUT_TYPE_ID) {
    return parseArrayOutput(textOutput);
  }

  return textOutput;
}

export type { RunSingleStepInput };
