-- App tables (public schema)

CREATE TABLE generations (
  id TEXT PRIMARY KEY NOT NULL,
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  github_summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workspaces (
  id TEXT PRIMARY KEY NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  input JSONB NOT NULL,
  github_summary JSONB,
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX workspaces_user_id_idx ON workspaces (user_id);

CREATE TABLE projects (
  id TEXT PRIMARY KEY NOT NULL,
  workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'failed')),
  idea JSONB,
  canvas JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX projects_workspace_id_idx ON projects (workspace_id);

CREATE TABLE generation_logs (
  id TEXT PRIMARY KEY NOT NULL,
  workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects (id) ON DELETE SET NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX generation_logs_workspace_id_idx ON generation_logs (workspace_id);

CREATE TABLE project_messages (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX project_messages_project_id_idx ON project_messages (project_id);

CREATE TABLE canvas_validations (
  project_id TEXT PRIMARY KEY NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  issues JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workspace_attachments (
  id TEXT PRIMARY KEY NOT NULL,
  workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  extracted_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX workspace_attachments_workspace_id_idx ON workspace_attachments (workspace_id);
