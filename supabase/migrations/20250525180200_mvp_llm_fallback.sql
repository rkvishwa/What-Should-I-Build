-- LLM fallback fields for MVP preview when v0 is unavailable

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS mvp_source TEXT;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS mvp_preview_html TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_mvp_source_check'
  ) THEN
    ALTER TABLE projects
      ADD CONSTRAINT projects_mvp_source_check
      CHECK (mvp_source IS NULL OR mvp_source IN ('v0', 'llm'));
  END IF;
END $$;
