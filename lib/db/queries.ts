import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { asc, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { FormInput } from "@/lib/schemas/form-input";
import type { IdeaOutput, Idea } from "@/lib/schemas/idea-output";
import type { CanvasData, ValidationIssue } from "@/lib/schemas/canvas";
import type { GitHubSummary } from "@/lib/github/fetch-profile";
import * as schema from "./schema";
import {
  canvasValidations,
  generationLogs,
  generations,
  projectMessages,
  projects,
  workspaceAttachments,
  workspaces,
} from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let db: PostgresJsDatabase<typeof schema> | null = null;

function getDb() {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not configured");
    }
    client = postgres(url, { prepare: false });
    db = drizzle(client, { schema });
  }
  return db;
}

export async function initDb() {
  return getDb();
}

// Legacy generations
export async function saveGeneration({
  id,
  input,
  output,
  githubSummary,
}: {
  id: string;
  input: FormInput;
  output: IdeaOutput;
  githubSummary: GitHubSummary | null;
}) {
  const database = getDb();
  await database.insert(generations).values({
    id,
    input,
    output,
    githubSummary,
  });
  return id;
}

export async function getGeneration(id: string) {
  const database = getDb();
  const rows = await database
    .select()
    .from(generations)
    .where(eq(generations.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// Workspaces
export async function createWorkspace({
  id,
  userId,
  input,
  githubSummary,
}: {
  id: string;
  userId: string;
  input: FormInput;
  githubSummary: GitHubSummary | null;
}) {
  const database = getDb();
  await database.insert(workspaces).values({
    id,
    userId,
    input,
    githubSummary,
    status: "generating",
  });
  return id;
}

export async function getWorkspace(id: string) {
  const database = getDb();
  const rows = await database
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getWorkspaceOwner(workspaceId: string) {
  const workspace = await getWorkspace(workspaceId);
  return workspace?.userId ?? null;
}

export async function updateWorkspaceStatus(
  id: string,
  status: "generating" | "ready" | "failed",
) {
  const database = getDb();
  await database
    .update(workspaces)
    .set({ status })
    .where(eq(workspaces.id, id));
}

export async function updateWorkspaceSummary(
  id: string,
  summary: IdeaOutput["summary"],
) {
  const database = getDb();
  await database
    .update(workspaces)
    .set({ outputSummary: summary })
    .where(eq(workspaces.id, id));
}

export async function getWorkspacesByUser(userId: string) {
  const database = getDb();
  return database
    .select()
    .from(workspaces)
    .where(eq(workspaces.userId, userId))
    .orderBy(desc(workspaces.createdAt));
}

export async function getUserWorkspacesWithProjects(userId: string) {
  const userWorkspaces = await getWorkspacesByUser(userId);
  const results = [];

  for (const workspace of userWorkspaces) {
    const workspaceProjects = await getProjectsByWorkspace(workspace.id);
    const firstIdea = workspaceProjects[0]?.idea as Idea | null | undefined;

    results.push({
      workspace,
      projectCount: workspaceProjects.length,
      firstIdeaTitle: firstIdea?.title ?? null,
      projects: workspaceProjects.map((p) => {
        const idea = p.idea as Idea | null;
        return {
          id: p.id,
          rank: p.rank,
          status: p.status,
          title: idea?.title ?? null,
          agentMdStatus: p.agentMdStatus,
          mvpStatus: p.mvpStatus,
        };
      }),
    });
  }

  return results;
}

export async function updateWorkspaceInput(id: string, input: FormInput) {
  const database = getDb();
  await database
    .update(workspaces)
    .set({ input })
    .where(eq(workspaces.id, id));
}

// Projects
export async function createProject({
  id,
  workspaceId,
  rank,
  status = "pending",
}: {
  id: string;
  workspaceId: string;
  rank: number;
  status?: "pending" | "generating" | "ready" | "failed";
}) {
  const database = getDb();
  await database.insert(projects).values({
    id,
    workspaceId,
    rank,
    status,
  });
  return id;
}

export async function getProjectsByWorkspace(workspaceId: string) {
  const database = getDb();
  return database
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(asc(projects.rank));
}

export async function getProject(id: string) {
  const database = getDb();
  const rows = await database
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateProjectStatus(
  id: string,
  status: "pending" | "generating" | "ready" | "failed",
) {
  const database = getDb();
  await database
    .update(projects)
    .set({ status, updatedAt: new Date() })
    .where(eq(projects.id, id));
}

export async function updateProjectIdea(id: string, idea: Idea) {
  const database = getDb();
  await database
    .update(projects)
    .set({ idea, updatedAt: new Date() })
    .where(eq(projects.id, id));
}

export async function updateProjectCanvas(id: string, canvas: CanvasData) {
  const database = getDb();
  await database
    .update(projects)
    .set({ canvas, updatedAt: new Date() })
    .where(eq(projects.id, id));
}

export type AgentMdStatus = "pending" | "generating" | "ready" | "failed";
export type MvpStatus = "idle" | "generating" | "ready" | "failed";
export type MvpSource = "v0" | "llm";

export async function updateProjectAgentMd(
  id: string,
  data: {
    agentMd?: string | null;
    agentMdStatus: AgentMdStatus;
    agentMdError?: string | null;
  },
) {
  const database = getDb();
  await database
    .update(projects)
    .set({
      agentMd: data.agentMd ?? undefined,
      agentMdStatus: data.agentMdStatus,
      agentMdError: data.agentMdError ?? null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));
}

export async function updateProjectMvp(
  id: string,
  data: {
    mvpStatus: MvpStatus;
    mvpSource?: MvpSource | null;
    mvpV0ChatId?: string | null;
    mvpDemoUrl?: string | null;
    mvpWebUrl?: string | null;
    mvpPreviewHtml?: string | null;
    mvpError?: string | null;
    mvpGeneratedAt?: Date | null;
  },
) {
  const database = getDb();
  await database
    .update(projects)
    .set({
      mvpStatus: data.mvpStatus,
      mvpSource: data.mvpSource ?? undefined,
      mvpV0ChatId: data.mvpV0ChatId ?? undefined,
      mvpDemoUrl: data.mvpDemoUrl ?? undefined,
      mvpWebUrl: data.mvpWebUrl ?? undefined,
      mvpPreviewHtml: data.mvpPreviewHtml ?? undefined,
      mvpError: data.mvpError ?? null,
      mvpGeneratedAt: data.mvpGeneratedAt ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));
}

export async function getNextProjectRank(workspaceId: string) {
  const existing = await getProjectsByWorkspace(workspaceId);
  return existing.length > 0
    ? Math.max(...existing.map((p) => p.rank)) + 1
    : 1;
}

// Logs
export async function appendLog({
  workspaceId,
  projectId,
  level = "info",
  message,
}: {
  workspaceId: string;
  projectId?: string;
  level?: "info" | "warn" | "error";
  message: string;
}) {
  const database = getDb();
  const id = nanoid(8);
  await database.insert(generationLogs).values({
    id,
    workspaceId,
    projectId: projectId ?? null,
    level,
    message,
  });
  return id;
}

export async function getLogsByWorkspace(workspaceId: string) {
  const database = getDb();
  return database
    .select()
    .from(generationLogs)
    .where(eq(generationLogs.workspaceId, workspaceId))
    .orderBy(asc(generationLogs.createdAt));
}

// Messages
export async function addProjectMessage({
  projectId,
  role,
  content,
}: {
  projectId: string;
  role: "user" | "assistant";
  content: string;
}) {
  const database = getDb();
  const id = nanoid(10);
  await database.insert(projectMessages).values({ id, projectId, role, content });
  return id;
}

export async function getProjectMessages(projectId: string, limit = 20) {
  const database = getDb();
  const rows = await database
    .select()
    .from(projectMessages)
    .where(eq(projectMessages.projectId, projectId))
    .orderBy(desc(projectMessages.createdAt))
    .limit(limit);
  return rows.reverse();
}

// Canvas validation
export async function saveCanvasValidation(
  projectId: string,
  issues: ValidationIssue[],
) {
  const database = getDb();
  const existing = await getCanvasValidation(projectId);

  if (existing) {
    await database
      .update(canvasValidations)
      .set({ issues, updatedAt: new Date() })
      .where(eq(canvasValidations.projectId, projectId));
  } else {
    await database.insert(canvasValidations).values({
      projectId,
      issues,
      updatedAt: new Date(),
    });
  }
}

export async function getCanvasValidation(projectId: string) {
  const database = getDb();
  const rows = await database
    .select()
    .from(canvasValidations)
    .where(eq(canvasValidations.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

// Attachments
export async function saveAttachment({
  id,
  workspaceId,
  filename,
  mimeType,
  size,
  storageKey,
  extractedText,
}: {
  id: string;
  workspaceId: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  extractedText: string;
}) {
  const database = getDb();
  await database.insert(workspaceAttachments).values({
    id,
    workspaceId,
    filename,
    mimeType,
    size,
    storageKey,
    extractedText,
  });
  return id;
}

export async function getAttachmentsByWorkspace(workspaceId: string) {
  const database = getDb();
  return database
    .select()
    .from(workspaceAttachments)
    .where(eq(workspaceAttachments.workspaceId, workspaceId))
    .orderBy(asc(workspaceAttachments.createdAt));
}

export async function getAttachment(id: string) {
  const database = getDb();
  const rows = await database
    .select()
    .from(workspaceAttachments)
    .where(eq(workspaceAttachments.id, id))
    .limit(1);
  return rows[0] ?? null;
}
