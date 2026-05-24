import type { Metadata } from "next";
import {
  DocsMobileNav,
  DocsSection,
  DocsSidebar,
} from "@/components/marketing/docs-sidebar";
import { MarketingDarkShell } from "@/components/marketing/marketing-dark-shell";

export const metadata: Metadata = {
  title: "Documentation — What Should I Build?",
  description:
    "Documentation for What Should I Build — getting started, idea intake, workspace features, and configuration.",
};

export default function DocsPage() {
  return (
    <MarketingDarkShell>
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
            Documentation
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Docs
          </h1>
          <p className="mt-4 text-zinc-400">
            Everything you need to generate ideas, use your workspace, and
            configure the app.
          </p>
        </div>

        <div className="mt-8 sm:mt-12">
          <DocsMobileNav />
        </div>

        <div className="mt-8 grid gap-12 sm:mt-12 lg:grid-cols-[200px_1fr]">
          <aside className="hidden lg:block">
            <DocsSidebar />
          </aside>

          <div className="min-w-0 space-y-12 sm:space-y-16">
            <DocsSection id="getting-started" title="Getting started">
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  <strong className="text-zinc-100">Sign in</strong> with GitHub
                  or Google.
                </li>
                <li>
                  Click <strong className="text-zinc-100">Create Idea</strong> to
                  open the console and fill in your profile or context.
                </li>
                <li>
                  Submit the form — you&apos;ll land on the generation page with
                  live logs.
                </li>
                <li>
                  When complete, explore your workspace: ranked projects,
                  attachments, and per-project tabs.
                </li>
              </ol>
              <p>
                Past sessions are available from your{" "}
                <strong className="text-zinc-100">Dashboard</strong>.
              </p>
            </DocsSection>

            <DocsSection id="idea-intake" title="Idea intake">
              <p>The console form supports three input modes:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <strong className="text-zinc-100">Developer profile</strong> —
                  skills, GitHub username, time available, career goals
                </li>
                <li>
                  <strong className="text-zinc-100">Freeform context</strong> —
                  hackathon themes, constraints, niche spaces
                </li>
                <li>
                  <strong className="text-zinc-100">Both</strong> — combine
                  profile and context
                </li>
              </ul>
              <p>
                <strong className="text-zinc-100">Seed idea:</strong> optional
                textarea — all generated ideas extend or relate to your concept.
              </p>
              <p>
                <strong className="text-zinc-100">File uploads:</strong> images,
                PDF, txt, md, json, csv (max 5 files, 5 MB each). Uploaded files
                are stored and viewable from the workspace.
              </p>
              <p>
                Without seed or files → <strong className="text-zinc-100">3 ideas</strong>.
                With seed and/or files →{" "}
                <strong className="text-zinc-100">5 ideas</strong> (closest match,
                3 variations, 1 adjacent).
              </p>
              <p>
                <strong className="text-zinc-100">Toggles:</strong>
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  Agentic coding — skills become optional when building with AI
                  agents
                </li>
                <li>
                  AI in the product — allow LLM/agent features inside the product
                  itself
                </li>
              </ul>
            </DocsSection>

            <DocsSection id="workspace" title="Workspace">
              <p>
                Each idea generation session creates a workspace containing ranked
                projects. From the workspace you can:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>View generation status and summary callouts</li>
                <li>Browse and open individual project tabs</li>
                <li>Generate another idea within the same session</li>
                <li>View and download uploaded attachments</li>
              </ul>
              <p>
                The <strong className="text-zinc-100">Dashboard</strong> lists all
                your past sessions with status badges and quick links.
              </p>
            </DocsSection>

            <DocsSection id="project-tabs" title="Project tabs">
              <p>Each project in a workspace has five tabs:</p>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <strong className="text-zinc-100">Overview</strong> — full idea
                  card with pitch, stack, MVP scope, roadmap, and monetization
                </li>
                <li>
                  <strong className="text-zinc-100">Agent</strong> —
                  auto-generated AGENTS.md; copy, download, or regenerate
                </li>
                <li>
                  <strong className="text-zinc-100">Canvas</strong> — React Flow
                  architecture diagram; editable nodes/edges with real-time
                  validation and design system panel
                </li>
                <li>
                  <strong className="text-zinc-100">MVP</strong> — live UI preview
                  powered by v0 (requires Agent tab to be ready)
                </li>
                <li>
                  <strong className="text-zinc-100">Chat</strong> — streaming
                  per-project chat with full project context
                </li>
              </ul>
            </DocsSection>

            <DocsSection id="environment" title="Environment variables">
              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900">
                      <th className="px-4 py-2 font-medium text-zinc-200">
                        Variable
                      </th>
                      <th className="px-4 py-2 font-medium text-zinc-200">
                        Required
                      </th>
                      <th className="px-4 py-2 font-medium text-zinc-200">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs text-marketing-accent">
                        LLM_API_KEY
                      </td>
                      <td className="px-4 py-2">Yes*</td>
                      <td className="px-4 py-2">
                        API key for your LLM provider
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs text-marketing-accent">
                        LLM_BASE_URL
                      </td>
                      <td className="px-4 py-2">No</td>
                      <td className="px-4 py-2">
                        Custom base URL (OpenAI, Groq, Ollama, etc.)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs text-marketing-accent">
                        LLM_MODEL
                      </td>
                      <td className="px-4 py-2">No</td>
                      <td className="px-4 py-2">
                        Model name (default: gpt-4o-mini)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs text-marketing-accent">
                        NEXT_PUBLIC_SUPABASE_URL
                      </td>
                      <td className="px-4 py-2">Yes</td>
                      <td className="px-4 py-2">Supabase project URL</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs text-marketing-accent">
                        NEXT_PUBLIC_SUPABASE_ANON_KEY
                      </td>
                      <td className="px-4 py-2">Yes</td>
                      <td className="px-4 py-2">Supabase anon key</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs text-marketing-accent">
                        DATABASE_URL
                      </td>
                      <td className="px-4 py-2">Yes</td>
                      <td className="px-4 py-2">
                        Postgres connection (Supabase pooler)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs text-marketing-accent">
                        GITHUB_TOKEN
                      </td>
                      <td className="px-4 py-2">No</td>
                      <td className="px-4 py-2">
                        Optional — enriches GitHub profile fetch during generation
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs text-marketing-accent">
                        V0_API_KEY
                      </td>
                      <td className="px-4 py-2">No</td>
                      <td className="px-4 py-2">
                        Required for MVP preview generation
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-zinc-500">
                *Or use OPENAI_API_KEY as a fallback alias for LLM_API_KEY.
              </p>
            </DocsSection>

            <DocsSection id="limits" title="Limits">
              <ul className="list-inside list-disc space-y-1">
                <li>5 workspace creations per hour per IP</li>
                <li>Max 5 file uploads, 5 MB each</li>
                <li>
                  MVP preview requires Agent instructions to be ready and a valid{" "}
                  <code className="font-mono text-xs text-marketing-accent">
                    V0_API_KEY
                  </code>
                </li>
                <li>
                  Image extraction uses your configured LLM — vision-capable
                  models (e.g. gpt-4o-mini) work best
                </li>
              </ul>
            </DocsSection>
          </div>
        </div>
      </main>
    </MarketingDarkShell>
  );
}
