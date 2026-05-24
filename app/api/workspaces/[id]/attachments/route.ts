import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { requireWorkspaceOwner } from "@/lib/auth/require-workspace-owner";
import {
  processWorkspaceAttachments,
  validateAttachmentFiles,
} from "@/lib/attachments/process-uploads";
import {
  appendLog,
  getWorkspace,
  initDb,
  updateWorkspaceInput,
} from "@/lib/db/queries";
import type { FormInput } from "@/lib/schemas/form-input";
import { getModelTierFromInput } from "@/lib/ai/model-tiers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: workspaceId } = await params;
  await initDb();

  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const forbidden = await requireWorkspaceOwner(workspaceId, auth.user);
  if (forbidden) return forbidden;

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);

  const validationError = validateAttachmentFiles(files);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const currentInput = workspace.input as FormInput;

  const attachmentMetas = await processWorkspaceAttachments({
    userId: auth.user.id,
    workspaceId,
    files,
    modelTier: getModelTierFromInput(currentInput),
  });

  const enrichedInput: FormInput = {
    ...currentInput,
    attachments: attachmentMetas.length ? attachmentMetas : undefined,
  };

  await updateWorkspaceInput(workspaceId, enrichedInput);

  if (attachmentMetas.length > 0) {
    await appendLog({
      workspaceId,
      message: `Using context from ${attachmentMetas.length} uploaded file(s)...`,
      level: "info",
    });
  }

  return NextResponse.json({
    count: attachmentMetas.length,
    attachments: attachmentMetas,
  });
}
