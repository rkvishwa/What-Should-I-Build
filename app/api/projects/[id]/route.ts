import {
  getProject,
  getProjectMessages,
  getWorkspace,
  initDb,
  updateProjectMvp,
} from "@/lib/db/queries";
import { resolveMvpStatus } from "@/lib/v0/generate-mvp";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await initDb();

  const project = await getProject(id);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const workspace = await getWorkspace(project.workspaceId);
  const messages = await getProjectMessages(id);

  const mvpStatus = resolveMvpStatus(project);
  const mvpError =
    mvpStatus === "failed" && project.mvpStatus === "generating"
      ? "MVP generation timed out. Try again."
      : project.mvpError;

  if (mvpStatus !== project.mvpStatus || mvpError !== project.mvpError) {
    await updateProjectMvp(id, { mvpStatus, mvpError });
  }

  return Response.json({
    project: {
      ...project,
      mvpStatus,
      mvpError,
    },
    workspace,
    messages,
  });
}
