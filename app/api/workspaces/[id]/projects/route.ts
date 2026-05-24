import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { requireWorkspaceOwner } from "@/lib/auth/require-workspace-owner";
import { getLlmConfig } from "@/lib/ai/config";
import { createAdditionalProjectId } from "@/lib/ai/generate-workspace";
import {
  createProject,
  getNextProjectRank,
  getWorkspace,
  initDb,
} from "@/lib/db/queries";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getLlmConfig()) {
    return NextResponse.json({ error: "LLM not configured" }, { status: 503 });
  }

  const { id: workspaceId } = await params;
  await initDb();

  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const forbidden = await requireWorkspaceOwner(workspaceId, auth.user);
  if (forbidden) return forbidden;

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const rank = await getNextProjectRank(workspaceId);
  const projectId = createAdditionalProjectId();

  await createProject({
    id: projectId,
    workspaceId,
    rank,
    status: "pending",
  });

  return NextResponse.json({ projectId });
}
