import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getUserWorkspacesWithProjects, initDb } from "@/lib/db/queries";

export async function GET() {
  await initDb();

  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const workspaces = await getUserWorkspacesWithProjects(auth.user.id);

  return NextResponse.json({ workspaces });
}
