import { downloadAttachmentFile } from "@/lib/attachments/storage";
import { getAttachment, initDb } from "@/lib/db/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  const { id: workspaceId, attachmentId } = await params;
  await initDb();

  const attachment = await getAttachment(attachmentId);
  if (!attachment || attachment.workspaceId !== workspaceId) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const buffer = await downloadAttachmentFile(attachment.storageKey);
    const isImage = attachment.mimeType.startsWith("image/");

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": isImage
          ? `inline; filename="${attachment.filename}"`
          : `attachment; filename="${attachment.filename}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return new Response("File not found in storage", { status: 404 });
  }
}
