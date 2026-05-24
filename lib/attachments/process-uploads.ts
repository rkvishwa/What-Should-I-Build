import { nanoid } from "nanoid";
import { extractFromFile } from "@/lib/attachments/extract";
import { saveAttachmentFile } from "@/lib/attachments/storage";
import {
  ALLOWED_MIME_TYPES,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
  type AttachmentMeta,
} from "@/lib/schemas/attachment";
import { saveAttachment } from "@/lib/db/queries";
import { type ModelTier } from "@/lib/ai/model-tiers";

export function isAllowedFile(file: File): boolean {
  if (ALLOWED_MIME_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".pdf") ||
    name.endsWith(".json") ||
    name.endsWith(".csv")
  );
}

export function validateAttachmentFiles(files: File[]): string | null {
  if (files.length > MAX_ATTACHMENTS) {
    return `Maximum ${MAX_ATTACHMENTS} files allowed`;
  }

  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return `File "${file.name}" exceeds 5 MB limit`;
    }
    if (!isAllowedFile(file)) {
      return `File type not supported: ${file.name}`;
    }
  }

  return null;
}

export async function processWorkspaceAttachments({
  userId,
  workspaceId,
  files,
  modelTier,
}: {
  userId: string;
  workspaceId: string;
  files: File[];
  modelTier?: ModelTier;
}): Promise<AttachmentMeta[]> {
  const attachmentMetas: AttachmentMeta[] = [];

  for (const file of files) {
    const attachmentId = nanoid(10);
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";
    const storageKey = await saveAttachmentFile(
      userId,
      workspaceId,
      attachmentId,
      file.name,
      buffer,
    );

    let extractedText = "";
    try {
      extractedText = await extractFromFile(
        buffer,
        file.name,
        mimeType,
        modelTier,
      );
    } catch {
      extractedText = "[Extraction failed — file stored for reference]";
    }

    await saveAttachment({
      id: attachmentId,
      workspaceId,
      filename: file.name,
      mimeType,
      size: file.size,
      storageKey,
      extractedText,
    });

    attachmentMetas.push({
      id: attachmentId,
      filename: file.name,
      mimeType,
      size: file.size,
      extractedText,
    });
  }

  return attachmentMetas;
}
