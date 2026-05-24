import { spawnSync } from "node:child_process";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(
    "DATABASE_URL is missing. Add it to .env.local before running db:migrate.",
  );
  process.exit(1);
}

console.log("Applying migrations via DATABASE_URL (direct connection)...");

const result = spawnSync(
  "npx",
  [
    "supabase",
    "db",
    "push",
    "--db-url",
    databaseUrl,
    "--include-all",
    "--yes",
    "--dns-resolver",
    "native",
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
);

if ((result.status ?? 1) === 0) {
  process.exit(0);
}

console.warn(
  "\nsupabase db push failed — falling back to direct SQL apply (db:apply)...",
);

const fallback = spawnSync("node", ["scripts/db-apply.mjs"], {
  stdio: "inherit",
});

process.exit(fallback.status ?? 1);
