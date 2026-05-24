import { WorkspaceShell } from "@/components/workspace-sidebar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkspaceShell workspaceId={id}>{children}</WorkspaceShell>;
}
