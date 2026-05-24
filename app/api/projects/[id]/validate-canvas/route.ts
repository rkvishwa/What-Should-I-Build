import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { requireProjectOwner } from "@/lib/auth/require-workspace-owner";
import {
  quickValidateCanvas,
  validateCanvas,
} from "@/lib/ai/validate-canvas";
import {
  getProject,
  getWorkspace,
  initDb,
  saveCanvasValidation,
} from "@/lib/db/queries";
import { canvasSchema } from "@/lib/schemas/canvas";
import type { FormInput } from "@/lib/schemas/form-input";
import type { Idea } from "@/lib/schemas/idea-output";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await initDb();

  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const forbidden = await requireProjectOwner(id, auth.user);
  if (forbidden) return forbidden;

  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = project.canvas;
  }

  const parsed = canvasSchema.safeParse(body ?? project.canvas);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid canvas data" }, { status: 400 });
  }

  const workspace = await getWorkspace(project.workspaceId);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const input = workspace.input as FormInput;
  const idea = project.idea as Idea | null;
  const quickIssues = quickValidateCanvas(input, parsed.data);

  let aiIssues: typeof quickIssues = [];
  try {
    aiIssues = await validateCanvas(
      input,
      parsed.data,
      idea?.title ?? "Project",
    );
  } catch {
    // fall back to quick validation only
  }

  const seen = new Set<string>();
  const issues = [...quickIssues, ...aiIssues].filter((issue) => {
    const key = `${issue.nodeId ?? ""}:${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  await saveCanvasValidation(id, issues);
  return NextResponse.json({ issues });
}
