import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing from .env.local");
  process.exit(1);
}

const repairMigration = resolve(
  process.cwd(),
  "supabase/migrations/20250525180100_ensure_agent_md_and_mvp.sql",
);

const sql = postgres(databaseUrl, { prepare: false, max: 1 });

try {
  console.log("Applying idempotent migration via direct SQL...");
  const content = readFileSync(repairMigration, "utf8");
  await sql.unsafe(content);

  const version = "20250525180100";
  const existing = await sql`
    SELECT version FROM supabase_migrations.schema_migrations
    WHERE version = ${version}
  `;

  if (existing.length === 0) {
    await sql`
      INSERT INTO supabase_migrations.schema_migrations (version)
      VALUES (${version})
    `;
    console.log(`Recorded migration ${version} in schema_migrations.`);
  }

  console.log("Migration applied successfully.");
} catch (error) {
  console.error(
    "Direct migration failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
} finally {
  await sql.end();
}
