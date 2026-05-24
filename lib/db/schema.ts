import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

export const generations = pgTable("generations", {
  id: text("id").primaryKey(),
  input: jsonb("input").notNull(),
  output: jsonb("output").notNull(),
  githubSummary: jsonb("github_summary"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  input: jsonb("input").notNull(),
  githubSummary: jsonb("github_summary"),
  outputSummary: jsonb("output_summary"),
  status: text("status", { enum: ["generating", "ready", "failed"] })
    .notNull()
    .default("generating"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  rank: integer("rank").notNull(),
  status: text("status", {
    enum: ["pending", "generating", "ready", "failed"],
  })
    .notNull()
    .default("pending"),
  idea: jsonb("idea"),
  canvas: jsonb("canvas"),
  agentMd: text("agent_md"),
  agentMdStatus: text("agent_md_status", {
    enum: ["pending", "generating", "ready", "failed"],
  })
    .notNull()
    .default("pending"),
  agentMdError: text("agent_md_error"),
  mvpStatus: text("mvp_status", {
    enum: ["idle", "generating", "ready", "failed"],
  })
    .notNull()
    .default("idle"),
  mvpV0ChatId: text("mvp_v0_chat_id"),
  mvpDemoUrl: text("mvp_demo_url"),
  mvpWebUrl: text("mvp_web_url"),
  mvpError: text("mvp_error"),
  mvpSource: text("mvp_source", { enum: ["v0", "llm"] }),
  mvpPreviewHtml: text("mvp_preview_html"),
  mvpGeneratedAt: timestamp("mvp_generated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const generationLogs = pgTable("generation_logs", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  projectId: text("project_id"),
  level: text("level", { enum: ["info", "warn", "error"] })
    .notNull()
    .default("info"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projectMessages = pgTable("project_messages", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const canvasValidations = pgTable("canvas_validations", {
  projectId: text("project_id").primaryKey(),
  issues: jsonb("issues").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const workspaceAttachments = pgTable("workspace_attachments", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  storageKey: text("storage_key").notNull(),
  extractedText: text("extracted_text").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
