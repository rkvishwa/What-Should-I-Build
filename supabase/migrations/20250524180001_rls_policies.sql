-- Row Level Security

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_attachments ENABLE ROW LEVEL SECURITY;

-- generations: legacy table, public read, authenticated insert
CREATE POLICY "generations_select_public"
  ON generations FOR SELECT
  USING (true);

CREATE POLICY "generations_insert_authenticated"
  ON generations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- workspaces: public read, owner write
CREATE POLICY "workspaces_select_public"
  ON workspaces FOR SELECT
  USING (true);

CREATE POLICY "workspaces_insert_owner"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspaces_update_owner"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspaces_delete_owner"
  ON workspaces FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- projects: public read, owner write via workspace
CREATE POLICY "projects_select_public"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "projects_insert_owner"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "projects_update_owner"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "projects_delete_owner"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND w.user_id = auth.uid()
    )
  );

-- generation_logs: public read, owner insert via workspace
CREATE POLICY "generation_logs_select_public"
  ON generation_logs FOR SELECT
  USING (true);

CREATE POLICY "generation_logs_insert_owner"
  ON generation_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND w.user_id = auth.uid()
    )
  );

-- project_messages: public read, owner write via project -> workspace
CREATE POLICY "project_messages_select_public"
  ON project_messages FOR SELECT
  USING (true);

CREATE POLICY "project_messages_insert_owner"
  ON project_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.id = project_id AND w.user_id = auth.uid()
    )
  );

-- canvas_validations: public read, owner write via project -> workspace
CREATE POLICY "canvas_validations_select_public"
  ON canvas_validations FOR SELECT
  USING (true);

CREATE POLICY "canvas_validations_insert_owner"
  ON canvas_validations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.id = project_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "canvas_validations_update_owner"
  ON canvas_validations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.id = project_id AND w.user_id = auth.uid()
    )
  );

-- workspace_attachments: public read, owner write via workspace
CREATE POLICY "workspace_attachments_select_public"
  ON workspace_attachments FOR SELECT
  USING (true);

CREATE POLICY "workspace_attachments_insert_owner"
  ON workspace_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "workspace_attachments_delete_owner"
  ON workspace_attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND w.user_id = auth.uid()
    )
  );
