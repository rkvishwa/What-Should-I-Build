import { after } from "next/server";
import { NextResponse } from "next/server";
import {
  runProjectMvpGeneration,
  startProjectMvpGeneration,
} from "@/lib/v0/generate-mvp";
import { isV0Configured } from "@/lib/v0/config";
import { requireUser } from "@/lib/auth/require-user";
import { requireProjectOwner } from "@/lib/auth/require-workspace-owner";
import { getProject, initDb } from "@/lib/db/queries";

export const maxDuration = 300;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await initDb();

  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const forbidden = await requireProjectOwner(id, auth.user);
  if (forbidden) return forbidden;

  if (!isV0Configured()) {
    return NextResponse.json(
      { error: "V0 is not configured. Set V0_API_KEY in your environment." },
      { status: 503 },
    );
  }

  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.agentMdStatus !== "ready" || !project.agentMd) {
    return NextResponse.json(
      {
        error:
          "Agent instructions must be ready before generating MVP preview. Open the Agent tab first.",
      },
      { status: 409 },
    );
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";

  try {
    const start = await startProjectMvpGeneration(id, auth.user.id, force);

    if (start.action === "ready") {
      return NextResponse.json({
        mvpStatus: "ready",
        demoUrl: start.result.demoUrl,
        webUrl: start.result.webUrl,
        v0ChatId: start.result.v0ChatId,
      });
    }

    after(async () => {
      try {
        await runProjectMvpGeneration(id, auth.user.id);
      } catch (error) {
        console.error("[generate-mvp] background generation failed:", error);
      }
    });

    return NextResponse.json({ mvpStatus: "generating" }, { status: 202 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "MVP generation failed";
    const status = message.includes("already being generated") ? 409 : 500;
    return NextResponse.json({ error: message, mvpStatus: "failed" }, { status });
  }
}
