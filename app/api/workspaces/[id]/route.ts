import {
  getAttachmentsByWorkspace,
  getLogsByWorkspace,
  getProjectsByWorkspace,
  getWorkspace,
  initDb,
} from "@/lib/db/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await initDb();

  const workspace = await getWorkspace(id);
  if (!workspace) {
    return Response.json({ error: "Workspace not found" }, { status: 404 });
  }

  const projects = await getProjectsByWorkspace(id);
  const logs = await getLogsByWorkspace(id);
  const attachments = await getAttachmentsByWorkspace(id);

  return Response.json({ workspace, projects, logs, attachments });
}
