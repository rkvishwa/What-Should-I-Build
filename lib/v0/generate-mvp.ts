import { v0 } from "v0-sdk";
import type { Idea } from "@/lib/schemas/idea-output";
import type { CanvasData } from "@/lib/schemas/canvas";
import type { FormInput } from "@/lib/schemas/form-input";
import {
  getProject,
  getWorkspace,
  updateProjectMvp,
} from "@/lib/db/queries";
import { getLlmConfig } from "@/lib/ai/config";
import {
  generateMvpFallbackHtml,
  shouldFallbackToLlm,
} from "@/lib/ai/generate-mvp-fallback";
import { getModelTierFromInput } from "@/lib/ai/model-tiers";
import { isV0Configured } from "./config";
import { buildV0MvpPrompt } from "./build-mvp-prompt";

export type MvpSource = "v0" | "llm";

export type MvpGenerationResult = {
  source: MvpSource;
  v0ChatId: string | null;
  demoUrl: string | null;
  webUrl: string | null;
  previewHtml: string | null;
};

export const MVP_GENERATION_STALE_MS = 2 * 60 * 1000;

type MvpProject = {
  mvpStatus: string;
  mvpDemoUrl: string | null;
  mvpPreviewHtml: string | null;
  mvpGeneratedAt: Date | null;
  updatedAt: Date;
};

export function isStaleMvpGeneration(project: MvpProject): boolean {
  return (
    project.mvpStatus === "generating" &&
    !project.mvpDemoUrl &&
    !project.mvpPreviewHtml &&
    Date.now() - project.updatedAt.getTime() > MVP_GENERATION_STALE_MS
  );
}

export function hasMvpPreview(project: {
  mvpDemoUrl: string | null;
  mvpPreviewHtml: string | null;
}): boolean {
  return Boolean(project.mvpDemoUrl || project.mvpPreviewHtml);
}

/** Recover projects stuck in `generating` after a successful run. */
export function resolveMvpStatus(
  project: MvpProject,
): "idle" | "generating" | "ready" | "failed" {
  if (isStaleMvpGeneration(project)) {
    return "failed";
  }

  if (
    project.mvpStatus === "generating" &&
    hasMvpPreview(project) &&
    project.mvpGeneratedAt
  ) {
    return "ready";
  }

  return project.mvpStatus as "idle" | "generating" | "ready" | "failed";
}

function toCachedResult(project: {
  mvpSource: string | null;
  mvpV0ChatId: string | null;
  mvpDemoUrl: string | null;
  mvpWebUrl: string | null;
  mvpPreviewHtml: string | null;
}): MvpGenerationResult {
  return {
    source: (project.mvpSource as MvpSource) ?? (project.mvpDemoUrl ? "v0" : "llm"),
    v0ChatId: project.mvpV0ChatId,
    demoUrl: project.mvpDemoUrl,
    webUrl: project.mvpWebUrl,
    previewHtml: project.mvpPreviewHtml,
  };
}

async function generateMvpViaV0(
  agentMd: string,
  idea: Idea,
  canvas: CanvasData | null,
  metadata: { projectId: string; workspaceId: string; userId: string },
): Promise<MvpGenerationResult> {
  if (!isV0Configured()) {
    throw new Error("V0 is not configured");
  }

  const message = buildV0MvpPrompt({ agentMd, idea, canvas });

  const chat = await v0.chats.create({
    message,
    system:
      "You build MVP UIs from AGENTS.md specs. Ship only must-have features with clean, modern design. Use React and Tailwind CSS.",
    chatPrivacy: "private",
    responseMode: "sync",
    metadata: {
      projectId: metadata.projectId.slice(0, 40),
      workspaceId: metadata.workspaceId.slice(0, 40),
      userId: metadata.userId.slice(0, 40),
    },
  });

  if (chat instanceof ReadableStream) {
    throw new Error("Unexpected streaming response from v0");
  }

  const demoUrl = chat.latestVersion?.demoUrl;
  if (!demoUrl) {
    throw new Error("v0 did not return a preview URL. Try again.");
  }

  return {
    source: "v0",
    v0ChatId: chat.id,
    demoUrl,
    webUrl: chat.webUrl ?? demoUrl,
    previewHtml: null,
  };
}

async function generateMvpViaLlm(
  agentMd: string,
  idea: Idea,
  canvas: CanvasData | null,
  input: FormInput,
): Promise<MvpGenerationResult> {
  const previewHtml = await generateMvpFallbackHtml({
    agentMd,
    idea,
    canvas,
    tier: getModelTierFromInput(input),
  });

  return {
    source: "llm",
    v0ChatId: null,
    demoUrl: null,
    webUrl: null,
    previewHtml,
  };
}

export async function generateMvpPreview(
  agentMd: string,
  idea: Idea,
  canvas: CanvasData | null,
  input: FormInput,
  metadata: { projectId: string; workspaceId: string; userId: string },
): Promise<MvpGenerationResult> {
  if (isV0Configured()) {
    try {
      return await generateMvpViaV0(agentMd, idea, canvas, metadata);
    } catch (error) {
      if (shouldFallbackToLlm(error)) {
        console.warn(
          "[generate-mvp] v0 failed, falling back to LLM:",
          error instanceof Error ? error.message : error,
        );
        return generateMvpViaLlm(agentMd, idea, canvas, input);
      }
      throw error;
    }
  }

  if (!getLlmConfig()) {
    throw new Error(
      "No MVP preview provider configured. Set V0_API_KEY or LLM_API_KEY.",
    );
  }

  return generateMvpViaLlm(agentMd, idea, canvas, input);
}

export type StartMvpGenerationResult =
  | { action: "ready"; result: MvpGenerationResult }
  | { action: "started" };

export async function startProjectMvpGeneration(
  projectId: string,
  userId: string,
  force = false,
): Promise<StartMvpGenerationResult> {
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (
    !force &&
    project.mvpStatus === "ready" &&
    hasMvpPreview(project) &&
    project.mvpGeneratedAt
  ) {
    return {
      action: "ready",
      result: toCachedResult(project),
    };
  }

  if (project.mvpStatus === "generating") {
    if (hasMvpPreview(project) && project.mvpGeneratedAt) {
      await updateProjectMvp(projectId, { mvpStatus: "ready", mvpError: null });
      return {
        action: "ready",
        result: toCachedResult(project),
      };
    }

    if (!force && !isStaleMvpGeneration(project)) {
      throw new Error("MVP preview is already being generated");
    }
  }

  if (project.agentMdStatus !== "ready" || !project.agentMd) {
    throw new Error(
      "Agent instructions must be ready before generating MVP preview",
    );
  }

  const idea = project.idea as Idea | null;
  if (!idea) {
    throw new Error("Project idea is not ready yet");
  }

  const workspace = await getWorkspace(project.workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  if (!isV0Configured() && !getLlmConfig()) {
    throw new Error(
      "No MVP preview provider configured. Set V0_API_KEY or LLM_API_KEY.",
    );
  }

  await updateProjectMvp(projectId, {
    mvpStatus: "generating",
    mvpError: null,
    mvpDemoUrl: null,
    mvpWebUrl: null,
    mvpV0ChatId: null,
    mvpPreviewHtml: null,
    mvpSource: null,
    mvpGeneratedAt: null,
  });

  return { action: "started" };
}

export async function runProjectMvpGeneration(
  projectId: string,
  userId: string,
): Promise<MvpGenerationResult> {
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.agentMdStatus !== "ready" || !project.agentMd) {
    throw new Error(
      "Agent instructions must be ready before generating MVP preview",
    );
  }

  const idea = project.idea as Idea | null;
  if (!idea) {
    throw new Error("Project idea is not ready yet");
  }

  const workspace = await getWorkspace(project.workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  try {
    const canvas = (project.canvas as CanvasData | null) ?? null;
    const result = await generateMvpPreview(
      project.agentMd,
      idea,
      canvas,
      workspace.input as FormInput,
      {
        projectId,
        workspaceId: project.workspaceId,
        userId,
      },
    );

    await updateProjectMvp(projectId, {
      mvpStatus: "ready",
      mvpSource: result.source,
      mvpV0ChatId: result.v0ChatId,
      mvpDemoUrl: result.demoUrl,
      mvpWebUrl: result.webUrl,
      mvpPreviewHtml: result.previewHtml,
      mvpError: null,
      mvpGeneratedAt: new Date(),
    });

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "MVP generation failed";
    await updateProjectMvp(projectId, {
      mvpStatus: "failed",
      mvpError: message,
    });
    throw error;
  }
}

/** @deprecated Use startProjectMvpGeneration + runProjectMvpGeneration instead. */
export async function ensureProjectMvp(
  projectId: string,
  userId: string,
  force = false,
): Promise<MvpGenerationResult> {
  const start = await startProjectMvpGeneration(projectId, userId, force);
  if (start.action === "ready") {
    return start.result;
  }
  return runProjectMvpGeneration(projectId, userId);
}
