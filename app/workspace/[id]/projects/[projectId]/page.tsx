import { notFound } from "next/navigation";
import { getProject, getProjectMessages, initDb } from "@/lib/db/queries";
import type { Idea } from "@/lib/schemas/idea-output";
import { canvasSchema, type CanvasData } from "@/lib/schemas/canvas";
import { ProjectDetailTabs } from "@/components/project-detail-tabs";

function parseCanvas(raw: unknown): CanvasData | null {
  if (!raw) return null;
  const parsed = canvasSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id: workspaceId, projectId } = await params;
  await initDb();

  const project = await getProject(projectId);
  if (!project) notFound();

  const idea = project.idea as Idea | null;
  const canvas = parseCanvas(project.canvas);
  const messages = await getProjectMessages(projectId);

  if (!idea) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <p className="text-zinc-500">Project is still generating...</p>
      </div>
    );
  }

  return (
    <ProjectDetailTabs
      workspaceId={workspaceId}
      idea={idea}
      projectId={projectId}
      projectStatus={project.status}
      canvas={canvas}
      messages={messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))}
      agentMd={project.agentMd}
      agentMdStatus={project.agentMdStatus}
      agentMdError={project.agentMdError}
      mvpStatus={project.mvpStatus}
      mvpDemoUrl={project.mvpDemoUrl}
      mvpWebUrl={project.mvpWebUrl}
      mvpPreviewHtml={project.mvpPreviewHtml}
      mvpSource={project.mvpSource}
      mvpError={project.mvpError}
    />
  );
}
