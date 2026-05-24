import { NextResponse } from "next/server";
import { ensureProjectCanvas } from "@/lib/ai/generate-canvas";
import { getLlmConfig } from "@/lib/ai/config";
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

  if (!getLlmConfig()) {
    return NextResponse.json(
      { error: "LLM is not configured" },
      { status: 503 },
    );
  }

  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const canvas = await ensureProjectCanvas(id);
    return NextResponse.json({ canvas });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Canvas generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
