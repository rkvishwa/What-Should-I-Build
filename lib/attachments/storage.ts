import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "workspace-attachments";

export function buildStorageKey(
  userId: string,
  workspaceId: string,
  attachmentId: string,
  filename: string,
): string {
  const ext = path.extname(filename);
  return `${userId}/${workspaceId}/${attachmentId}${ext}`;
}

export async function saveAttachmentFile(
  userId: string,
  workspaceId: string,
  attachmentId: string,
  filename: string,
  buffer: Buffer,
): Promise<string> {
  const storageKey = buildStorageKey(
    userId,
    workspaceId,
    attachmentId,
    filename,
  );
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storageKey, buffer, { upsert: false });

  if (error) {
    throw new Error(`Failed to upload attachment: ${error.message}`);
  }

  return storageKey;
}

export async function downloadAttachmentFile(
  storageKey: string,
): Promise<Buffer> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(storageKey);

  if (error || !data) {
    throw new Error(error?.message ?? "File not found");
  }

  return Buffer.from(await data.arrayBuffer());
}

export async function getSignedAttachmentUrl(
  storageKey: string,
  expiresIn = 3600,
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storageKey, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create signed URL");
  }

  return data.signedUrl;
}
