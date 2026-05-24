-- Idempotent repair migration (safe to re-run)
-- Use when supabase db push fails or columns are missing.

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS output_summary JSONB;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS agent_md TEXT;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS agent_md_error TEXT;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS mvp_v0_chat_id TEXT;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS mvp_demo_url TEXT;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS mvp_web_url TEXT;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS mvp_error TEXT;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS mvp_generated_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'agent_md_status'
  ) THEN
    ALTER TABLE projects
      ADD COLUMN agent_md_status TEXT NOT NULL DEFAULT 'pending'
      CHECK (agent_md_status IN ('pending', 'generating', 'ready', 'failed'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'mvp_status'
  ) THEN
    ALTER TABLE projects
      ADD COLUMN mvp_status TEXT NOT NULL DEFAULT 'idle'
      CHECK (mvp_status IN ('idle', 'generating', 'ready', 'failed'));
  END IF;
END $$;
