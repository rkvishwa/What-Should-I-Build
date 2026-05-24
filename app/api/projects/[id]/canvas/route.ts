import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { requireProjectOwner } from "@/lib/auth/require-workspace-owner";
import { getProject, initDb, updateProjectCanvas } from "@/lib/db/queries";
import { canvasSchema } from "@/lib/schemas/canvas";

export async function PATCH(
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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = canvasSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid canvas" },
      { status: 400 },
    );
  }

  await updateProjectCanvas(id, parsed.data);
  return NextResponse.json({ ok: true });
}
