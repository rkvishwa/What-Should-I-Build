import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { generateIdeas } from "@/lib/ai/generate-ideas";
import { getLlmConfig } from "@/lib/ai/config";
import { saveGeneration } from "@/lib/db/queries";
import { fetchGitHubProfile } from "@/lib/github/fetch-profile";
import { checkRateLimit } from "@/lib/rate-limit";
import { formInputSchema } from "@/lib/schemas/form-input";

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
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = formInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const githubSummary = input.githubUsername?.trim()
    ? await fetchGitHubProfile(input.githubUsername.trim())
    : null;

  try {
    const output = await generateIdeas(input, githubSummary);
    const id = nanoid(10);
    await saveGeneration({ id, input, output, githubSummary });

    return NextResponse.json(
      { id },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      },
    );
  } catch (error) {
    console.error("Generation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate ideas. Check your LLM configuration.",
      },
      { status: 500 },
    );
  }
}
