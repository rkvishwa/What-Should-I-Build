import { getProject, initDb } from "@/lib/db/queries";
import { requireUser } from "@/lib/auth/require-user";
import { requireProjectOwner } from "@/lib/auth/require-workspace-owner";

export async function GET(
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
  if (!project?.mvpPreviewHtml) {
    return new Response("Preview not found", { status: 404 });
  }

  return new Response(project.mvpPreviewHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
