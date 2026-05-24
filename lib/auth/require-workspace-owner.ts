import { NextResponse } from "next/server";
import { getWorkspaceOwner } from "@/lib/db/queries";
import type { User } from "@supabase/supabase-js";

export async function requireWorkspaceOwner(
  workspaceId: string,
  user: User,
): Promise<NextResponse | null> {
  const ownerId = await getWorkspaceOwner(workspaceId);
  if (!ownerId) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }
  if (ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function requireProjectOwner(
  projectId: string,
  user: User,
): Promise<NextResponse | null> {
  const { getProject } = await import("@/lib/db/queries");
  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  return requireWorkspaceOwner(project.workspaceId, user);
}
