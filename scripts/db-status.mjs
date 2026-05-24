import postgres from "postgres";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing from .env.local");
  process.exit(1);
}

const expected = [
  "workspaces.output_summary",
  "projects.agent_md",
  "projects.agent_md_status",
  "projects.agent_md_error",
  "projects.mvp_status",
  "projects.mvp_v0_chat_id",
  "projects.mvp_demo_url",
  "projects.mvp_web_url",
  "projects.mvp_error",
  "projects.mvp_generated_at",
];

const sql = postgres(databaseUrl, { prepare: false, max: 1 });

try {
  const rows = await sql`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('workspaces', 'projects')
  `;

  const found = new Set(rows.map((r) => `${r.table_name}.${r.column_name}`));
  const missing = expected.filter((col) => !found.has(col));

  if (missing.length === 0) {
    console.log("OK — all agent/MVP columns exist.");
  } else {
    console.error("Missing columns:");
    for (const col of missing) console.error(`  - ${col}`);
    console.error("\nRun: npm run db:migrate");
    process.exit(1);
  }

  const migrations = await sql`
    SELECT version
    FROM supabase_migrations.schema_migrations
    ORDER BY version
  `;
  console.log("\nApplied migrations:");
  for (const row of migrations) {
    console.log(`  - ${row.version}`);
  }
} catch (error) {
  console.error(
    "Could not check database:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
} finally {
  await sql.end();
}
