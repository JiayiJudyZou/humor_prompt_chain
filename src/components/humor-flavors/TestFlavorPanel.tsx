"use client";

import { FormEvent, useMemo, useState } from "react";

type TestFlavorResponse = {
  success: boolean;
  humorFlavorId: number | null;
  imageId: string | null;
  captions: unknown[];
  rawApiResponse: unknown;
  debug?: {
    usedImageUrl: string | null;
    usedUploadedFile: boolean;
    selectedFlavorId: number | null;
  } | null;
  error?: string;
};

type TestFlavorPanelProps = {
  selectedFlavorId: number | null;
  selectedFlavorSlug: string | null;
};

function stripCaptionPrefix(value: string): string {
  return value
    .replace(/^\s*(?:[-*•]+|\d+[\).:\-]|[a-zA-Z][\).:\-])\s*/, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
}

function firstReadableText(record: Record<string, unknown>): string {
  const preferredKeys = ["content", "caption", "text", "value"];

  for (const key of preferredKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return stripCaptionPrefix(value);
    }
  }

  return "";
}

function readableCaptionFromUnknown(item: unknown): string {
  if (typeof item === "string") {
    return stripCaptionPrefix(item);
  }

  if (!item || typeof item !== "object") {
    return "";
  }

  const record = item as Record<string, unknown>;
  const directText = firstReadableText(record);
  if (directText) {
    return directText;
  }

  const nestedKeys = ["data", "result", "caption", "item"];
  for (const key of nestedKeys) {
    const nested = record[key];
    if (nested && typeof nested === "object") {
      const nestedText = firstReadableText(nested as Record<string, unknown>);
      if (nestedText) {
        return nestedText;
      }
    }
  }

  return "";
}

function normalizeCaptions(captions: unknown[]): string[] {
  return captions.map(readableCaptionFromUnknown).filter(Boolean);
}

function extractCaptionLikeArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;

  if (Array.isArray(record.captions)) {
    return record.captions;
  }

  if (record.data && typeof record.data === "object") {
    const nestedData = record.data as Record<string, unknown>;
    if (Array.isArray(nestedData.captions)) {
      return nestedData.captions;
    }
  }

  return [];
}

function readErrorMessage(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "Failed to run humor flavor test.";
  }

  const record = value as Record<string, unknown>;
  return typeof record.error === "string" && record.error.trim()
    ? record.error
    : "Failed to run humor flavor test.";
}

export default function TestFlavorPanel({
  selectedFlavorId,
  selectedFlavorSlug,
}: TestFlavorPanelProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestFlavorResponse | null>(null);

  const finalCaptions = useMemo(
    () => {
      if (!result) {
        return [];
      }

      const topLevelCaptions = Array.isArray(result.captions) ? result.captions : [];
      const sourceCaptions =
        topLevelCaptions.length > 0
          ? topLevelCaptions
          : extractCaptionLikeArray(result.rawApiResponse);

      return normalizeCaptions(sourceCaptions);
    },
    [result]
  );

  const canRun = useMemo(
    () =>
      Boolean(selectedFlavorId) &&
      (imageUrl.trim().length > 0 || Boolean(imageFile)) &&
      !isLoading,
    [selectedFlavorId, imageUrl, imageFile, isLoading]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!selectedFlavorId) {
      setError("Select a humor flavor before running the test.");
      return;
    }

    const trimmedImageUrl = imageUrl.trim();
    if (!trimmedImageUrl && !imageFile) {
      setError("Provide an image URL or upload an image file.");
      return;
    }

    setIsLoading(true);

    try {
      const effectiveImageUrl = imageFile ? "" : trimmedImageUrl;
      const formData = new FormData();
      formData.append("humorFlavorId", String(selectedFlavorId));
      formData.append("imageUrl", effectiveImageUrl);
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      const response = await fetch("/api/test-humor-flavor", {
        method: "POST",
        body: formData,
      });

      const body = (await response.json()) as unknown;

      if (!response.ok) {
        setError(readErrorMessage(body));
        return;
      }

      setResult(body as TestFlavorResponse);
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:border-rose-400/25 dark:bg-[#171620]/92 dark:shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:p-6">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500 dark:text-rose-300">
          Test Runner
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Run Humor Flavor
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Selected flavor:{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {selectedFlavorSlug ?? "None"}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 dark:border-rose-400/20 dark:bg-rose-500/8 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-500 dark:text-rose-300">
            Image Input
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Paste an image URL or upload an image file
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-rose-100 bg-white p-3 dark:border-rose-300/25 dark:bg-[#11111a]">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                Option 1: Image URL
              </p>
              <label
                htmlFor="test-flavor-image-url"
                className="mt-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300"
              >
                URL
              </label>
              <input
                id="test-flavor-image-url"
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] focus:border-rose-300 focus:outline-none dark:border-rose-300/35 dark:bg-[#0f0f17] dark:text-slate-100 dark:focus:border-rose-300/55"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-rose-100 dark:bg-rose-400/25" />
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-400 dark:text-rose-300">
                or
              </p>
              <div className="h-px flex-1 bg-rose-100 dark:bg-rose-400/25" />
            </div>

            <div className="rounded-xl border border-rose-100 bg-white p-3 dark:border-rose-300/25 dark:bg-[#11111a]">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                Option 2: Upload File
              </p>
              <label
                htmlFor="test-flavor-image-file"
                className="mt-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300"
              >
                Image File
              </label>
              <input
                id="test-flavor-image-file"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null;
                  setImageFile(nextFile);
                }}
                className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] file:mr-3 file:rounded-lg file:border-0 file:bg-rose-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-rose-700 hover:file:bg-rose-200 focus:border-rose-300 focus:outline-none dark:border-rose-300/35 dark:bg-[#0f0f17] dark:text-slate-200 dark:file:bg-rose-500/25 dark:file:text-rose-100 dark:hover:file:bg-rose-500/35 dark:focus:border-rose-300/55"
              />
              {imageFile ? (
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Selected: {imageFile.name}</p>
              ) : null}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canRun}
          className="inline-flex items-center rounded-xl border border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_8px_18px_rgba(190,24,93,0.10)] transition hover:from-rose-200 hover:to-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-300/35 dark:bg-gradient-to-r dark:from-rose-500/25 dark:to-pink-500/14 dark:text-rose-100 dark:shadow-[0_8px_20px_rgba(244,63,94,0.24)] dark:hover:from-rose-500/35 dark:hover:to-pink-500/24"
        >
          {isLoading ? "Running..." : "Run Humor Flavor"}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-300/40 dark:bg-rose-500/12 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-4">
          <section className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-amber-50/60 to-white p-4 shadow-[0_10px_22px_rgba(190,24,93,0.10)] dark:border-rose-300/30 dark:bg-gradient-to-br dark:from-[#191521] dark:via-[#221821] dark:to-[#15151e] dark:shadow-[0_10px_24px_rgba(244,63,94,0.2)] sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-600 dark:text-rose-300">
              Final Captions
            </p>
            {finalCaptions.length > 0 ? (
              <ol className="mt-3 space-y-2">
                {finalCaptions.map((caption, index) => (
                  <li
                    key={`${index}-${caption}`}
                    className="rounded-xl border border-rose-100 bg-white px-3.5 py-2.5 text-sm text-slate-800 dark:border-rose-300/25 dark:bg-[#0f0f17] dark:text-slate-100"
                  >
                    <span className="mr-2 text-xs font-semibold text-rose-500 dark:text-rose-300">
                      {index + 1}.
                    </span>
                    {caption}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 rounded-xl border border-rose-100 bg-white px-3.5 py-2.5 text-sm text-slate-600 dark:border-rose-300/25 dark:bg-[#0f0f17] dark:text-slate-300">
                No readable captions were returned.
              </p>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
