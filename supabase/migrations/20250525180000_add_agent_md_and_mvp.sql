-- Workspace batch summary (bestPick, fastestToShip, etc.)
ALTER TABLE workspaces
  ADD COLUMN output_summary JSONB;

-- Per-project agent instructions and MVP preview state
ALTER TABLE projects
  ADD COLUMN agent_md TEXT,
  ADD COLUMN agent_md_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (agent_md_status IN ('pending', 'generating', 'ready', 'failed')),
  ADD COLUMN agent_md_error TEXT,
  ADD COLUMN mvp_status TEXT NOT NULL DEFAULT 'idle'
    CHECK (mvp_status IN ('idle', 'generating', 'ready', 'failed')),
  ADD COLUMN mvp_v0_chat_id TEXT,
  ADD COLUMN mvp_demo_url TEXT,
  ADD COLUMN mvp_web_url TEXT,
  ADD COLUMN mvp_error TEXT,
  ADD COLUMN mvp_generated_at TIMESTAMPTZ;
