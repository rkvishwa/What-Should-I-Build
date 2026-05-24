import { generateObject } from "ai";
import type { FormInput } from "@/lib/schemas/form-input";
import type { Idea } from "@/lib/schemas/idea-output";
import { canvasSchema, type CanvasData } from "@/lib/schemas/canvas";
import {
  getProject,
  getWorkspace,
  updateProjectCanvas,
  updateProjectStatus,
} from "@/lib/db/queries";
import { getLanguageModel } from "./client";
import { getModelTierFromInput } from "./model-tiers";
import { buildCanvasSystemPrompt, buildCanvasUserPrompt } from "./prompts";

export async function generateCanvas(
  input: FormInput,
  idea: Idea,
): Promise<CanvasData> {
  const { object } = await generateObject({
    model: getLanguageModel(getModelTierFromInput(input)),
    schema: canvasSchema,
    system: buildCanvasSystemPrompt(input),
    prompt: buildCanvasUserPrompt(idea),
  });

  return object;
}

export async function ensureProjectCanvas(projectId: string): Promise<CanvasData> {
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.canvas) {
    return project.canvas as CanvasData;
  }

  const idea = project.idea as Idea | null;
  if (!idea) {
    throw new Error("Project idea is not ready yet");
  }

  const workspace = await getWorkspace(project.workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  await updateProjectStatus(projectId, "generating");

  try {
    const canvas = await generateCanvas(
      workspace.input as FormInput,
      idea,
    );
    await updateProjectCanvas(projectId, canvas);
    await updateProjectStatus(projectId, "ready");
    return canvas;
  } catch (error) {
    await updateProjectStatus(projectId, "failed");
    throw error;
  }
}
