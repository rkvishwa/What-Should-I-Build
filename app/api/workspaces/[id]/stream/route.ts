import {
  getLogsByWorkspace,
  getProjectsByWorkspace,
  getWorkspace,
  initDb,
} from "@/lib/db/queries";
import {
  runSingleProjectGeneration,
  runWorkspaceGeneration,
} from "@/lib/ai/generate-workspace";
import type { FormInput } from "@/lib/schemas/form-input";
import {
  emitWorkspaceState,
  formatSseEvent,
  isGenerationActive,
  pollUntilWorkspaceSettled,
  releaseGeneration,
  tryAcquireGeneration,
} from "@/lib/generation/sse";
import { getLlmConfig } from "@/lib/ai/config";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: workspaceId } = await params;
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!getLlmConfig()) {
    return new Response(
      formatSseEvent({ type: "error", message: "LLM not configured" }),
      { status: 503, headers: { "Content-Type": "text/event-stream" } },
    );
  }

  await initDb();
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return new Response(
      formatSseEvent({ type: "error", message: "Workspace not found" }),
      { status: 404, headers: { "Content-Type": "text/event-stream" } },
    );
  }

  let generationStarted = false;
  const pollSignal = { aborted: false };

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const emit = async (event: unknown) => {
        controller.enqueue(encoder.encode(formatSseEvent(event)));
      };

      const existingLogs = await getLogsByWorkspace(workspaceId);
      for (const log of existingLogs) {
        await emit({
          type: "log",
          message: log.message,
          level: log.level,
        });
      }

      await emitWorkspaceState(workspaceId, emit);

      if (workspace.status === "ready" || workspace.status === "failed") {
        controller.close();
        return;
      }

      if (!tryAcquireGeneration(workspaceId)) {
        await pollUntilWorkspaceSettled(workspaceId, emit, pollSignal);
        controller.close();
        return;
      }

      generationStarted = true;

      try {
        const input = workspace.input as FormInput;
        const projects = await getProjectsByWorkspace(workspaceId);
        const projectIds = projects.map((p) => p.id);

        if (projectId) {
          await runSingleProjectGeneration(
            workspaceId,
            input,
            projectId,
            emit,
          );
        } else {
          await runWorkspaceGeneration(workspaceId, input, projectIds, emit);
        }
      } catch {
        // errors already emitted
      } finally {
        releaseGeneration(workspaceId);
        if (!isGenerationActive(workspaceId)) {
          await emitWorkspaceState(workspaceId, emit, { finalOnly: true });
        }
        controller.close();
      }
    },
    cancel() {
      pollSignal.aborted = true;
      if (!generationStarted && isGenerationActive(workspaceId)) {
        releaseGeneration(workspaceId);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
