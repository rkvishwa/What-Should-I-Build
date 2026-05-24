const pendingFilesByWorkspace = new Map<string, File[]>();

export function stashWorkspaceFiles(workspaceId: string, files: File[]) {
  if (files.length === 0) return;
  pendingFilesByWorkspace.set(workspaceId, files);
}

export function takeWorkspaceFiles(workspaceId: string): File[] {
  const files = pendingFilesByWorkspace.get(workspaceId) ?? [];
  pendingFilesByWorkspace.delete(workspaceId);
  return files;
}

export function peekWorkspaceFiles(workspaceId: string): File[] {
  return pendingFilesByWorkspace.get(workspaceId) ?? [];
}
