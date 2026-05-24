import { nanoid } from "nanoid";
import type { FormInput } from "@/lib/schemas/form-input";
import { getIdeaCount } from "@/lib/schemas/form-input";
import type { Idea } from "@/lib/schemas/idea-output";
import { fetchGitHubProfile } from "@/lib/github/fetch-profile";
import {
  appendLog,
  getProjectsByWorkspace,
  updateProjectCanvas,
  updateProjectIdea,
  updateProjectStatus,
  updateWorkspaceStatus,
  updateWorkspaceSummary,
} from "@/lib/db/queries";
import { generateIdeas } from "./generate-ideas";
import { generateCanvas } from "./generate-canvas";
import { generateAndSaveAgentMd } from "./generate-agent-md";

export type GenerationEvent =
  | { type: "log"; message: string; level?: "info" | "warn" | "error" }
  | { type: "project_status"; projectId: string; status: string; title?: string }
  | { type: "project_ready"; projectId: string; title: string }
  | { type: "workspace_ready" }
  | { type: "error"; message: string };

type EmitFn = (event: GenerationEvent) => void | Promise<void>;

async function log(
  workspaceId: string,
  emit: EmitFn,
  message: string,
  projectId?: string,
  level: "info" | "warn" | "error" = "info",
) {
  await appendLog({ workspaceId, projectId, message, level });
  await emit({ type: "log", message, level });
}

async function generateProjectAgentMd(
  input: FormInput,
  workspaceId: string,
  projectId: string,
  idea: Idea,
  emit: EmitFn,
) {
  await log(
    workspaceId,
    emit,
    `Writing agent instructions for "${idea.title}"...`,
    projectId,
  );

  try {
    await generateAndSaveAgentMd(projectId, input, idea, null);
  } catch {
    await log(
      workspaceId,
      emit,
      `Agent instructions used fallback for "${idea.title}"`,
      projectId,
      "warn",
    );
  }
}

async function generateProjectCanvas(
  input: FormInput,
  workspaceId: string,
  projectId: string,
  idea: Idea,
  emit: EmitFn,
) {
  await log(
    workspaceId,
    emit,
    `Creating architecture for "${idea.title}"...`,
    projectId,
  );
  await updateProjectStatus(projectId, "generating");
  await emit({
    type: "project_status",
    projectId,
    status: "generating",
    title: idea.title,
  });

  try {
    const canvas = await generateCanvas(input, idea);
    await updateProjectCanvas(projectId, canvas);
    await updateProjectStatus(projectId, "ready");
    await log(workspaceId, emit, `Ready: "${idea.title}"`, projectId);
    await emit({ type: "project_ready", projectId, title: idea.title });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Canvas generation failed";
    await updateProjectStatus(projectId, "failed");
    await log(workspaceId, emit, message, projectId, "error");
    throw error;
  }
}

export async function runWorkspaceGeneration(
  workspaceId: string,
  input: FormInput,
  projectIds: string[],
  emit: EmitFn,
) {
  try {
    await log(workspaceId, emit, "Analyzing your inputs...");

    if (input.seedIdea?.trim()) {
      await log(workspaceId, emit, "Using your seed idea as anchor...");
    }
    if (input.attachments?.length) {
      await log(
        workspaceId,
        emit,
        `Using context from ${input.attachments.length} uploaded file(s)...`,
      );
    }

    let githubSummary = null;
    if (input.githubUsername?.trim()) {
      await log(workspaceId, emit, "Reading GitHub profile...");
      githubSummary = await fetchGitHubProfile(input.githubUsername.trim());
      if (githubSummary) {
        await log(workspaceId, emit, `Found GitHub user @${githubSummary.username}`);
      } else {
        await log(
          workspaceId,
          emit,
          "GitHub user not found — continuing without it",
          undefined,
          "warn",
        );
      }
    }

    const ideaCount = getIdeaCount(input);
    await log(
      workspaceId,
      emit,
      ideaCount === 5
        ? "Thinking — generating 5 anchored project ideas..."
        : "Thinking — generating 3 project ideas...",
    );
    for (const pid of projectIds) {
      await updateProjectStatus(pid, "generating");
      await emit({ type: "project_status", projectId: pid, status: "generating" });
    }

    const output = await generateIdeas(input, githubSummary);

    await updateWorkspaceSummary(workspaceId, output.summary);
    await log(workspaceId, emit, "Ideas ready — writing agent instructions...");

    const tasks = output.ideas.map(async (idea, index) => {
      const projectId = projectIds[index];
      if (!projectId) return;

      await updateProjectIdea(projectId, idea);
      await emit({
        type: "project_status",
        projectId,
        status: "generating",
        title: idea.title,
      });
      await generateProjectAgentMd(input, workspaceId, projectId, idea, emit);
      await log(workspaceId, emit, "Building architecture diagrams...");
      await generateProjectCanvas(input, workspaceId, projectId, idea, emit);
    });

    const results = await Promise.allSettled(tasks);
    const rejected = results.filter((result) => result.status === "rejected");
    const succeeded = results.length - rejected.length;

    for (let i = output.ideas.length; i < projectIds.length; i++) {
      const orphanId = projectIds[i];
      if (!orphanId) continue;
      await updateProjectStatus(orphanId, "failed");
      await emit({
        type: "project_status",
        projectId: orphanId,
        status: "failed",
      });
    }

    const updatedProjects = await getProjectsByWorkspace(workspaceId);
    for (const project of updatedProjects) {
      if (project.status === "generating" && !project.canvas) {
        await updateProjectStatus(project.id, "failed");
        const idea = project.idea as Idea | null;
        await emit({
          type: "project_status",
          projectId: project.id,
          status: "failed",
          title: idea?.title,
        });
      }
    }

    if (succeeded === 0) {
      const message =
        rejected[0]?.status === "rejected"
          ? rejected[0].reason instanceof Error
            ? rejected[0].reason.message
            : "Canvas generation failed"
          : "Canvas generation failed";
      await log(workspaceId, emit, message, undefined, "error");
      await updateWorkspaceStatus(workspaceId, "failed");
      await emit({ type: "error", message });
      return;
    }

    if (rejected.length > 0) {
      await log(
        workspaceId,
        emit,
        `${rejected.length} project(s) failed canvas generation — open them to retry`,
        undefined,
        "warn",
      );
    }

    await updateWorkspaceStatus(workspaceId, "ready");
    await log(workspaceId, emit, "All projects ready!");
    await emit({ type: "workspace_ready" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Generation failed";
    await log(workspaceId, emit, message, undefined, "error");
    await updateWorkspaceStatus(workspaceId, "failed");
    for (const pid of projectIds) {
      await updateProjectStatus(pid, "failed");
    }
    await emit({ type: "error", message });
    throw error;
  }
}

export async function runSingleProjectGeneration(
  workspaceId: string,
  input: FormInput,
  projectId: string,
  emit: EmitFn,
) {
  try {
    await log(workspaceId, emit, "Generating a new project idea...", projectId);
    await updateProjectStatus(projectId, "generating");
    await emit({ type: "project_status", projectId, status: "generating" });

    const output = await generateIdeas(input, null);
    const idea = output.ideas[0];
    if (!idea) throw new Error("No idea generated");

    idea.rank = await getProjectRank(projectId);
    await updateProjectIdea(projectId, idea);
    await generateProjectAgentMd(input, workspaceId, projectId, idea, emit);
    await generateProjectCanvas(input, workspaceId, projectId, idea, emit);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Generation failed";
    await log(workspaceId, emit, message, projectId, "error");
    await updateProjectStatus(projectId, "failed");
    await emit({ type: "error", message });
    throw error;
  }
}

async function getProjectRank(projectId: string) {
  const { getProject } = await import("@/lib/db/queries");
  const project = await getProject(projectId);
  return project?.rank ?? 1;
}

export function createWorkspaceWithProjects(projectCount: 3 | 5 = 3) {
  const workspaceId = nanoid(10);
  const projectIds = Array.from({ length: projectCount }, () => nanoid(10));
  return { workspaceId, projectIds };
}

export function createAdditionalProjectId() {
  return nanoid(10);
}
