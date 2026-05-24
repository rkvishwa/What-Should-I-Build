const activeGenerations = new Set<string>();

export function tryAcquireGeneration(workspaceId: string): boolean {
  if (activeGenerations.has(workspaceId)) {
    return false;
  }
  activeGenerations.add(workspaceId);
  return true;
}

export function releaseGeneration(workspaceId: string) {
  activeGenerations.delete(workspaceId);
}

export function isGenerationActive(workspaceId: string): boolean {
  return activeGenerations.has(workspaceId);
}

export function formatSseEvent(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function emitWorkspaceState(
  workspaceId: string,
  emit: (event: unknown) => void | Promise<void>,
  options?: { finalOnly?: boolean },
) {
  const { getProjectsByWorkspace, getWorkspace } = await import(
    "@/lib/db/queries"
  );
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) return null;

  const projects = await getProjectsByWorkspace(workspaceId);

  if (!options?.finalOnly) {
    for (const project of projects) {
      const idea = project.idea as { title?: string } | null;
      await emit({
        type: "project_status",
        projectId: project.id,
        status: project.status,
        title: idea?.title,
      });
      if (project.status === "ready" && idea?.title) {
        await emit({
          type: "project_ready",
          projectId: project.id,
          title: idea.title,
        });
      }
    }
  }

  if (workspace.status === "ready") {
    await emit({ type: "workspace_ready" });
  } else if (workspace.status === "failed") {
    await emit({ type: "error", message: "Generation previously failed" });
  }

  return workspace;
}

export async function pollUntilWorkspaceSettled(
  workspaceId: string,
  emit: (event: unknown) => void | Promise<void>,
  signal?: { aborted: boolean },
) {
  await emit({ type: "generation_in_progress" });

  while (!signal?.aborted) {
    const workspace = await emitWorkspaceState(workspaceId, emit);
    if (!workspace || workspace.status !== "generating") {
      return workspace;
    }
    await sleep(2000);
  }

  return null;
}
