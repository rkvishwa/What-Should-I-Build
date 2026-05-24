import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getLlmConfig } from "@/lib/ai/config";
import { createWorkspaceWithProjects } from "@/lib/ai/generate-workspace";
import {
  processWorkspaceAttachments,
  validateAttachmentFiles,
} from "@/lib/attachments/process-uploads";
import {
  createProject,
  createWorkspace,
  initDb,
  updateWorkspaceInput,
} from "@/lib/db/queries";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  formInputSchema,
  shouldGenerateFive,
  type FormInput,
} from "@/lib/schemas/form-input";
import { parseModelTier } from "@/lib/ai/model-tiers";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  if (!getLlmConfig()) {
    return NextResponse.json(
      {
        error:
          "LLM is not configured. Set LLM_API_KEY (or OPENAI_API_KEY) in your environment.",
      },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in an hour." },
      { status: 429 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const inputRaw = formData.get("input");
  if (typeof inputRaw !== "string") {
    return NextResponse.json({ error: "Missing input field" }, { status: 400 });
  }

  let parsedInput: ReturnType<typeof formInputSchema.safeParse>;
  try {
    parsedInput = formInputSchema.safeParse(JSON.parse(inputRaw));
  } catch {
    return NextResponse.json({ error: "Invalid input JSON" }, { status: 400 });
  }

  if (!parsedInput.success) {
    return NextResponse.json(
      { error: parsedInput.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const modelTierRaw = formData.get("modelTier");
  const input: FormInput = {
    ...parsedInput.data,
    modelTier: parseModelTier(
      typeof modelTierRaw === "string" ? modelTierRaw : parsedInput.data.modelTier,
    ),
  };

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const pendingFileCountRaw = formData.get("pendingFileCount");
  const pendingFileCount =
    typeof pendingFileCountRaw === "string"
      ? Math.max(0, Number.parseInt(pendingFileCountRaw, 10) || 0)
      : 0;

  const validationError = validateAttachmentFiles(files);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  await initDb();

  const ideaCount =
    shouldGenerateFive(input) ||
    files.length > 0 ||
    pendingFileCount > 0
      ? 5
      : 3;

  const { workspaceId, projectIds } = createWorkspaceWithProjects(ideaCount);

  await createWorkspace({
    id: workspaceId,
    userId: auth.user.id,
    input,
    githubSummary: null,
  });

  let enrichedInput: FormInput = input;

  if (files.length > 0) {
    const attachmentMetas = await processWorkspaceAttachments({
      userId: auth.user.id,
      workspaceId,
      files,
      modelTier: input.modelTier,
    });
    enrichedInput = {
      ...input,
      attachments: attachmentMetas.length ? attachmentMetas : undefined,
    };
    await updateWorkspaceInput(workspaceId, enrichedInput);
  }

  for (let i = 0; i < projectIds.length; i++) {
    await createProject({
      id: projectIds[i]!,
      workspaceId,
      rank: i + 1,
      status: "pending",
    });
  }

  return NextResponse.json({
    workspaceId,
    ideaCount,
    pendingUpload: pendingFileCount > 0,
  });
}
