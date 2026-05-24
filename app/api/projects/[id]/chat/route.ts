import { streamText } from "ai";
import { requireUser } from "@/lib/auth/require-user";
import { requireProjectOwner } from "@/lib/auth/require-workspace-owner";
import { getLanguageModel } from "@/lib/ai/client";
import { getModelTierFromInput } from "@/lib/ai/model-tiers";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import {
  addProjectMessage,
  getProject,
  getProjectMessages,
  getWorkspace,
  initDb,
} from "@/lib/db/queries";
import type { FormInput } from "@/lib/schemas/form-input";
import type { Idea } from "@/lib/schemas/idea-output";
import type { CanvasData } from "@/lib/schemas/canvas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;
  await initDb();

  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const forbidden = await requireProjectOwner(projectId, auth.user);
  if (forbidden) return forbidden;

  const project = await getProject(projectId);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const workspace = await getWorkspace(project.workspaceId);
  if (!workspace) {
    return Response.json({ error: "Workspace not found" }, { status: 404 });
  }

  const body = (await request.json()) as { message?: string };
  if (!body.message?.trim()) {
    return Response.json({ error: "Message required" }, { status: 400 });
  }

  const input = workspace.input as FormInput;
  const idea = project.idea as Idea;
  const canvas = project.canvas as CanvasData | null;
  const history = await getProjectMessages(projectId);

  await addProjectMessage({
    projectId,
    role: "user",
    content: body.message.trim(),
  });

  const contextPrompt = `Project: ${idea.title}
Pitch: ${idea.pitch}
Stack: ${idea.stack.technologies.join(", ")}
Canvas summary: ${canvas ? `${canvas.architecture.nodes.length} nodes, ${canvas.architecture.edges.length} edges` : "none"}

Recent conversation:
${history.map((m) => `${m.role}: ${m.content}`).join("\n")}

User: ${body.message.trim()}`;

  const result = streamText({
    model: getLanguageModel(getModelTierFromInput(input)),
    system: buildChatSystemPrompt(input),
    prompt: contextPrompt,
    onFinish: async ({ text }) => {
      await addProjectMessage({
        projectId,
        role: "assistant",
        content: text,
      });
    },
  });

  return result.toTextStreamResponse();
}
