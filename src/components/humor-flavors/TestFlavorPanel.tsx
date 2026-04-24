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
  technicalDetails?: string;
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

type ParsedErrorMessage = {
  message: string;
  technicalDetails?: string;
};

function readErrorMessage(value: unknown): ParsedErrorMessage {
  if (!value || typeof value !== "object") {
    return {
      message: "Something went wrong while running this humor flavor test. Please try again.",
    };
  }

  const record = value as Record<string, unknown>;
  const message =
    typeof record.error === "string" && record.error.trim()
      ? record.error
      : "Something went wrong while running this humor flavor test. Please try again.";

  const technicalDetails =
    typeof record.technicalDetails === "string" && record.technicalDetails.trim()
      ? record.technicalDetails
      : undefined;

  return { message, technicalDetails };
}

export default function TestFlavorPanel({
  selectedFlavorId,
  selectedFlavorSlug,
}: TestFlavorPanelProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ParsedErrorMessage | null>(null);
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
      setError({ message: "Please select a humor flavor before running the test." });
      return;
    }

    const trimmedImageUrl = imageUrl.trim();
    if (!trimmedImageUrl && !imageFile) {
      setError({ message: "Please add an image URL or upload an image file." });
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
      setError({
        message: "Something went wrong while sending your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="admin-surface p-5 sm:p-6">
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
        <div className="admin-surface-subtle p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-500 dark:text-rose-300">
            Image Input
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Paste an image URL or upload an image file
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-white/90 p-3 shadow-sm shadow-rose-900/5 dark:bg-[#11111a]">
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
                className="admin-input mt-2"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-rose-100 dark:bg-rose-400/25" />
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-400 dark:text-rose-300">
                or
              </p>
              <div className="h-px flex-1 bg-rose-100 dark:bg-rose-400/25" />
            </div>

            <div className="rounded-xl bg-white/90 p-3 shadow-sm shadow-rose-900/5 dark:bg-[#11111a]">
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
                className="admin-input mt-2 text-slate-700 dark:text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-rose-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-rose-700 hover:file:bg-rose-200 dark:file:bg-rose-500/25 dark:file:text-rose-100 dark:hover:file:bg-rose-500/35"
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
          className="admin-button-primary"
        >
          {isLoading ? "Running..." : "Run Humor Flavor"}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 dark:border-rose-300/40 dark:bg-rose-500/12 dark:text-rose-200">
          {error.technicalDetails ? (
            <>
              <p className="font-semibold">
                This humor flavor could not generate captions.
              </p>
              <p className="mt-1">
                This humor flavor is written incorrectly. Please check the steps
                in this humor flavor and try again.
              </p>
            </>
          ) : (
            <p>{error.message}</p>
          )}
          {error.technicalDetails ? (
            <details className="mt-2 rounded-lg border border-rose-200/70 bg-white/70 px-3 py-2 text-xs text-rose-800 dark:border-rose-300/35 dark:bg-[#12101a]/70 dark:text-rose-100">
              <summary className="cursor-pointer font-semibold text-rose-700 dark:text-rose-200">
                Show technical details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-rose-700 dark:text-rose-100">
                {error.technicalDetails}
              </pre>
            </details>
          ) : null}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-4">
          <section className="admin-surface-subtle p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-600 dark:text-rose-300">
              Final Captions
            </p>
            {finalCaptions.length > 0 ? (
              <ol className="mt-3 space-y-2">
                {finalCaptions.map((caption, index) => (
                  <li
                    key={`${index}-${caption}`}
                    className="rounded-xl bg-white/90 px-3.5 py-2.5 text-sm text-slate-800 shadow-sm shadow-rose-900/5 dark:bg-[#0f0f17] dark:text-slate-100"
                  >
                    <span className="mr-2 text-xs font-semibold text-rose-500 dark:text-rose-300">
                      {index + 1}.
                    </span>
                    {caption}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 rounded-xl bg-white/90 px-3.5 py-2.5 text-sm text-slate-600 shadow-sm shadow-rose-900/5 dark:bg-[#0f0f17] dark:text-slate-300">
                No readable captions were returned.
              </p>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
