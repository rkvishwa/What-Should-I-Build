import { z } from "zod";

export const attachmentMetaSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number().int().min(0),
  extractedText: z.string(),
});

export type AttachmentMeta = z.infer<typeof attachmentMetaSchema>;

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];
