import { generateText } from "ai";
import type { FormInput } from "@/lib/schemas/form-input";
import type { Idea } from "@/lib/schemas/idea-output";
import type { CanvasData } from "@/lib/schemas/canvas";
import {
  getProject,
  getWorkspace,
  updateProjectAgentMd,
} from "@/lib/db/queries";
import { getLanguageModel } from "./client";
import { getModelTierFromInput } from "./model-tiers";
import { getLlmConfig } from "./config";
import {
  buildAgentMdSystemPrompt,
  buildAgentMdUserPrompt,
} from "./prompts-agent-md";
import { buildAgentMdFallback } from "./build-agent-md-fallback";

export async function generateAgentMd(
  input: FormInput,
  idea: Idea,
  canvas: CanvasData | null = null,
): Promise<string> {
  const fallback = buildAgentMdFallback(input, idea, canvas);

  if (!getLlmConfig()) {
    return fallback;
  }

  try {
    const { text } = await generateText({
      model: getLanguageModel(getModelTierFromInput(input)),
      system: buildAgentMdSystemPrompt(input),
      prompt: buildAgentMdUserPrompt(input, idea, canvas),
    });

    const trimmed = text.trim();
    return trimmed.length > 100 ? trimmed : fallback;
  } catch {
    return fallback;
  }
}

const STALE_GENERATING_MS = 2 * 60 * 1000;

function isStaleGenerating(updatedAt: Date | null | undefined): boolean {
  if (!updatedAt) return true;
  return Date.now() - updatedAt.getTime() > STALE_GENERATING_MS;
}

export async function ensureProjectAgentMd(projectId: string): Promise<string> {
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.agentMdStatus === "ready" && project.agentMd) {
    return project.agentMd;
  }

  if (
    project.agentMdStatus === "generating" &&
    !isStaleGenerating(project.updatedAt)
  ) {
    throw new Error("Agent instructions are already being generated");
  }

  if (project.agentMdStatus === "generating") {
    await updateProjectAgentMd(projectId, {
      agentMdStatus: "pending",
      agentMdError: null,
    });
  }

  const idea = project.idea as Idea | null;
  if (!idea) {
    throw new Error("Project idea is not ready yet");
  }

  const workspace = await getWorkspace(project.workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  await updateProjectAgentMd(projectId, {
    agentMdStatus: "generating",
    agentMdError: null,
  });

  try {
    const canvas = (project.canvas as CanvasData | null) ?? null;
    const agentMd = await generateAgentMd(
      workspace.input as FormInput,
      idea,
      canvas,
    );

    await updateProjectAgentMd(projectId, {
      agentMd,
      agentMdStatus: "ready",
      agentMdError: null,
    });

    return agentMd;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Agent MD generation failed";
    await updateProjectAgentMd(projectId, {
      agentMdStatus: "failed",
      agentMdError: message,
    });
    throw error;
  }
}

export async function generateAndSaveAgentMd(
  projectId: string,
  input: FormInput,
  idea: Idea,
  canvas: CanvasData | null = null,
): Promise<string> {
  await updateProjectAgentMd(projectId, {
    agentMdStatus: "generating",
    agentMdError: null,
  });

  try {
    const agentMd = await generateAgentMd(input, idea, canvas);
    await updateProjectAgentMd(projectId, {
      agentMd,
      agentMdStatus: "ready",
      agentMdError: null,
    });
    return agentMd;
  } catch {
    const fallback = buildAgentMdFallback(input, idea, canvas);
    await updateProjectAgentMd(projectId, {
      agentMd: fallback,
      agentMdStatus: "ready",
      agentMdError: null,
    });
    return fallback;
  }
}
