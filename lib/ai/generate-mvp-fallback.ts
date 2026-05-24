import { generateText } from "ai";
import type { Idea } from "@/lib/schemas/idea-output";
import type { CanvasData } from "@/lib/schemas/canvas";
import { getLanguageModel } from "./client";
import { getLlmConfig } from "./config";
import { buildMvpFallbackHtml } from "./build-mvp-fallback-html";
import { buildV0MvpPrompt } from "@/lib/v0/build-mvp-prompt";

export function isV0RateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /\b429\b|too_many_requests|daily message limit/i.test(error.message);
}

export function isV0ApiError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /v0|HTTP \d{3}/i.test(error.message);
}

export function shouldFallbackToLlm(error: unknown): boolean {
  if (!getLlmConfig()) return false;
  return isV0RateLimitError(error) || isV0ApiError(error);
}

function extractHtml(text: string): string {
  const fenced = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    return trimmed;
  }

  return trimmed;
}

function buildMvpHtmlSystemPrompt(): string {
  return [
    "You are an expert product UI developer.",
    "Generate a single self-contained HTML document for an MVP prototype.",
    "Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown fences.",
    "Use inline CSS only — no external stylesheets, scripts, or CDN links.",
    "Make it responsive, accessible, and polished.",
    "Ship ONLY must-have MVP features from the spec.",
    "Include realistic placeholder data where needed.",
    "Do not include cut-for-later features.",
  ].join(" ");
}

export async function generateMvpFallbackHtml({
  agentMd,
  idea,
  canvas,
  tier = "advanced",
}: {
  agentMd: string;
  idea: Idea;
  canvas: CanvasData | null;
  tier?: "fast" | "advanced";
}): Promise<string> {
  const deterministic = buildMvpFallbackHtml(idea, canvas);

  if (!getLlmConfig()) {
    return deterministic;
  }

  const specPrompt = buildV0MvpPrompt({ agentMd, idea, canvas });

  try {
    const { text } = await generateText({
      model: getLanguageModel(tier),
      system: buildMvpHtmlSystemPrompt(),
      prompt: `${specPrompt}\n\nBuild the HTML prototype now.`,
    });

    const html = extractHtml(text);
    if (html.length < 200 || !html.includes("<")) {
      return deterministic;
    }

    return html;
  } catch {
    return deterministic;
  }
}
