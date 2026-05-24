# What Should I Build?

An AI-powered project idea generator for developers. Describe your skills, goals, or constraints — get ranked project ideas with architecture diagrams, agent instructions, MVP previews, and per-project chat in an interactive workspace.

**Live docs:** after starting the app, visit [/docs](http://localhost:3000/docs) for a full user guide.

---

## What it does

1. **Sign in** with GitHub or Google.
2. **Create an idea session** — share your developer profile, freeform context, or both. Optionally add a seed idea and file uploads.
3. **Watch live generation** — streamed logs show each phase as ideas are created.
4. **Explore your workspace** — ranked projects with overview, agent instructions, architecture canvas, MVP preview, and chat.

Without a seed idea or uploads you get **3 ideas**. With a seed and/or files you get **5** (closest match, 3 variations, 1 adjacent).

---

## Features

| Feature | Description |
|---------|-------------|
| **Tailored idea generation** | Ideas matched to your profile, skills, and constraints |
| **Seed idea + file uploads** | Anchor generation with a concept or images, PDFs, and docs |
| **Agentic & AI toggles** | Choose agentic coding workflows and whether AI lives inside the product |
| **Live generation logs** | Real-time SSE logs — no black box |
| **Interactive workspace** | Ranked projects, attachments, status tracking |
| **Architecture canvas** | React Flow diagrams with validation and a design system panel |
| **AGENTS.md generation** | Copy-ready agent instructions for Cursor and similar tools |
| **v0 MVP preview** | Live UI preview before you write code |
| **Per-project chat** | Streaming chat with full project context |
| **Provider-agnostic LLM** | OpenAI-compatible API via env vars (OpenAI, Groq, Ollama, etc.) |

---

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router) + React 19
- **Database:** PostgreSQL via [Supabase](https://supabase.com) + [Drizzle ORM](https://orm.drizzle.team)
- **Auth:** Supabase Auth (GitHub + Google OAuth)
- **Storage:** Supabase Storage (workspace attachments)
- **AI:** [Vercel AI SDK](https://sdk.vercel.ai) with OpenAI-compatible providers
- **Canvas:** [React Flow](https://reactflow.dev)
- **MVP previews:** [v0 Platform API](https://v0.dev)
- **Styling:** Tailwind CSS 4

---

## Prerequisites

- **Node.js** 20+
- **npm**
- A **Supabase** project ([create one free](https://supabase.com/dashboard))
- An **LLM API key** (OpenAI, Groq, or any OpenAI-compatible provider)
- *(Optional)* **v0 API key** for MVP preview generation
- *(Optional)* **GitHub token** to raise rate limits when fetching GitHub profiles during generation

---

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd What-Should-I-Build
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
# LLM (required) — pick one provider
LLM_API_KEY=your-key-here
# LLM_BASE_URL=https://api.openai.com/v1   # default
# LLM_MODEL=gpt-4o-mini                    # default

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Postgres (required) — use Supabase pooler, Transaction mode (port 6543)
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true

# Optional
# GITHUB_TOKEN=ghp_...
# V0_API_KEY=...   # https://v0.dev/chat/settings/keys
```

See [Environment variables](#environment-variables) for all options and provider examples.

### 3. Set up Supabase

**Auth providers** — in the [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Providers, enable **GitHub** and/or **Google**. Add this redirect URL:

```
http://localhost:3000/auth/callback
```

For production, also add your deployed URL (e.g. `https://your-app.vercel.app/auth/callback`).

**Database** — apply migrations:

```bash
npm run db:migrate
```

This runs `supabase db push` against your `DATABASE_URL`. If push fails (common with pooler URLs), it falls back to `npm run db:apply`.

> **Tip:** If migrations fail on port 6543, temporarily switch `DATABASE_URL` to Session mode (port **5432**) in `.env.local`, run `npm run db:migrate`, then switch back to 6543 for the app.

**Storage** — migrations create a private `workspace-attachments` bucket automatically. No extra setup needed.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in, and click **Create Idea**.

---

## Local Supabase (optional)

To run Supabase locally instead of a cloud project:

```bash
# Requires Docker and the Supabase CLI: https://supabase.com/docs/guides/cli
npm run db:start    # start local Supabase
npm run db:reset    # reset DB and re-apply migrations
npm run db:stop     # stop local Supabase
```

Point `.env.local` at the local Supabase URLs and keys printed by `supabase start`.

---

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LLM_API_KEY` | Yes* | — | API key for your LLM provider |
| `OPENAI_API_KEY` | Yes* | — | Fallback alias for `LLM_API_KEY` |
| `LLM_BASE_URL` | No | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_MODEL` | No | `gpt-4o-mini` | Default model when no tier is selected |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | — | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | — | Service role key (file uploads & storage) |
| `DATABASE_URL` | Yes | — | Postgres connection string (Supabase pooler) |
| `GITHUB_TOKEN` | No | — | Raises GitHub API rate limits during profile fetch |
| `V0_API_KEY` | No | — | Required for MVP preview generation |

\*Set at least one of `LLM_API_KEY` or `OPENAI_API_KEY`.

### LLM provider examples

**OpenAI (default)**

```bash
LLM_API_KEY=sk-...
# LLM_BASE_URL=https://api.openai.com/v1
# LLM_MODEL=gpt-4o-mini
```

**Groq**

```bash
LLM_API_KEY=gsk_...
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile
```

**Local Ollama / LM Studio**

```bash
LLM_API_KEY=ollama
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=llama3.2
```

> **Note:** Image extraction from uploads uses your configured LLM. Vision-capable models (e.g. `gpt-4o-mini`) work best.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Apply Supabase migrations to remote DB |
| `npm run db:apply` | Apply migrations via direct SQL (fallback) |
| `npm run db:status` | Check migration status |
| `npm run db:new <name>` | Create a new migration file |
| `npm run db:start` | Start local Supabase (Docker) |
| `npm run db:stop` | Stop local Supabase |
| `npm run db:reset` | Reset local DB and re-run migrations |

---

## Project structure

```
app/
  (marketing)/     Landing page, about, docs
  auth/            Login and OAuth callback
  console/         Idea intake form
  dashboard/       Past sessions
  workspace/       Generation view + project detail
  api/             REST + SSE endpoints
components/
  marketing/       Landing page UI
  canvas/          React Flow architecture editor
  design-system/   Shared UI primitives
lib/
  ai/              LLM client, prompts, generation logic
  auth/            Session helpers
  db/              Drizzle schema and queries
  supabase/        Supabase clients and middleware
  attachments/     File upload and extraction
  v0/              MVP preview generation
supabase/
  migrations/      SQL migrations (schema, RLS, storage)
```

---

## Deployment

Works well on [Vercel](https://vercel.com) or any Node.js host that supports Next.js.

1. Set all required environment variables in your hosting provider.
2. Add production OAuth redirect URLs in Supabase Auth settings.
3. Run `npm run db:migrate` against your production `DATABASE_URL` (Session mode / port 5432 if pooler push fails).
4. Deploy with `npm run build && npm run start`.

**Production notes:**

- **SSE generation** may hit serverless timeouts on long runs — self-host or increase `maxDuration` on Vercel.
- **Rate limiting** is in-memory (5 workspace creations per hour per IP) — resets on cold starts in serverless; use Redis or similar for strict production limits.
- **MVP previews** require a valid `V0_API_KEY` and AGENTS.md to be generated first.

---

## Limits

- 5 workspace creations per hour per IP
- Max 5 file uploads per session, 5 MB each
- Supported upload types: images, PDF, txt, md, json, csv
- MVP preview requires Agent tab to be ready and `V0_API_KEY` to be set

---

## License

MIT
