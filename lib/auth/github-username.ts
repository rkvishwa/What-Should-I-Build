import type { User } from "@supabase/supabase-js";
import { normalizeGitHubUsername } from "@/lib/schemas/form-input";

function readGitHubUsernameFromRecord(
  record: Record<string, unknown> | undefined,
): string | undefined {
  if (!record) return undefined;

  const candidates = [
    record.user_name,
    record.preferred_username,
    record.login,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeGitHubUsername(candidate);
    if (normalized) return normalized;
  }

  return undefined;
}

export function getGitHubUsernameFromUser(user: User): string | undefined {
  const fromMetadata = readGitHubUsernameFromRecord(
    user.user_metadata as Record<string, unknown> | undefined,
  );
  if (fromMetadata) return fromMetadata;

  const githubIdentity = user.identities?.find(
    (identity) => identity.provider === "github",
  );

  return readGitHubUsernameFromRecord(
    githubIdentity?.identity_data as Record<string, unknown> | undefined,
  );
}
