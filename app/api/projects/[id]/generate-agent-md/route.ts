import { NextResponse } from "next/server";
import { ensureProjectAgentMd } from "@/lib/ai/generate-agent-md";
import { requireUser } from "@/lib/auth/require-user";
import { requireProjectOwner } from "@/lib/auth/require-workspace-owner";
import { getProject, initDb } from "@/lib/db/queries";

export async function POST(
  _request: Request,
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

  try {
    const agentMd = await ensureProjectAgentMd(id);
    return NextResponse.json({ agentMd, agentMdStatus: "ready" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Agent MD generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
