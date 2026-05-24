-- Storage bucket for workspace attachments

INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-attachments', 'workspace-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Owner can upload to their folder: {user_id}/{workspace_id}/...
CREATE POLICY "attachments_insert_owner"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'workspace-attachments'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

-- Owner can read their files
CREATE POLICY "attachments_select_owner"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'workspace-attachments'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

-- Owner can delete their files
CREATE POLICY "attachments_delete_owner"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'workspace-attachments'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

-- Service role / signed URLs used for public attachment downloads from API
