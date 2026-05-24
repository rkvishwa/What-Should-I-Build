import type { FormInput } from "@/lib/schemas/form-input";
import type { Idea } from "@/lib/schemas/idea-output";
import type { CanvasData } from "@/lib/schemas/canvas";

export function buildAgentMdSystemPrompt(input: FormInput): string {
  const rules = [
    "You write AGENTS.md files for AI coding agents (Cursor, Copilot, etc.) to build a software project.",
    "Output ONLY valid markdown — no code fences wrapping the whole document.",
    "Be specific and actionable: name files, routes, components, and acceptance criteria.",
    "MVP scope must list ONLY must-have features. Explicitly list cut-for-later items as out of scope.",
    "Build phases must include copy-paste prompts an agent can run phase-by-phase.",
    "Match the user's time budget — never scope beyond what they can ship.",
  ];

  if (input.agenticCoding) {
    rules.push(
      "The user builds with AI coding agents. Write instructions optimized for agentic workflows.",
    );
  }

  if (!input.aiInProduct) {
    rules.push(
      "AI in product is DISABLED. Do NOT suggest LLMs, chatbots, agents, or ML in the product.",
    );
  }

  return rules.join("\n");
}

export function buildAgentMdUserPrompt(
  input: FormInput,
  idea: Idea,
  canvas: CanvasData | null,
): string {
  const sections: string[] = [
    `Write a complete AGENTS.md for this project idea.`,
    "",
    "## Project",
    `Title: ${idea.title}`,
    `Pitch: ${idea.pitch}`,
    `Why it fits: ${idea.whyItFits}`,
    "",
    "## Stack",
    idea.stack.technologies.map((t) => `- ${t}`).join("\n"),
    idea.stack.rationale,
    "",
    "## MVP must-have",
    ...idea.mvpScope.mustHave.map((item) => `- ${item}`),
    "",
    "## Cut for later (do NOT build in MVP)",
    ...idea.mvpScope.cutForLater.map((item) => `- ${item}`),
    "",
    "## Roadmap",
    ...idea.roadmap.flatMap((phase) => [
      `### ${phase.phase}`,
      ...phase.goals.map((g) => `- ${g}`),
    ]),
    "",
    "## Monetization",
    ...idea.monetization.map((m) => `- ${m}`),
    "",
    "## Meta notes",
    idea.metaNotes,
  ];

  if (idea.agentStack) {
    sections.push(
      "",
      "## Recommended agent stack",
      `- Model: ${idea.agentStack.model}`,
      `- Orchestration: ${idea.agentStack.orchestration}`,
      `- Tools: ${idea.agentStack.tools.join(", ")}`,
    );
  }

  if (input.timeAvailable?.trim()) {
    sections.push("", `Time budget: ${input.timeAvailable.trim()}`);
  }

  if (canvas) {
    const { designSystem, architecture } = canvas;
    sections.push(
      "",
      "## Architecture (reference)",
      `${architecture.nodes.length} nodes, ${architecture.edges.length} edges`,
      ...architecture.nodes.slice(0, 12).map(
        (n) => `- ${n.id} (${n.type}): ${n.data.label}`,
      ),
      "",
      "## Design system (use these tokens)",
      ...designSystem.tokens.colors.map((c) => `- Color ${c.name}: ${c.value}`),
      ...designSystem.tokens.typography.map(
        (t) => `- Typography ${t.name}: ${t.value}`,
      ),
      ...designSystem.components.map(
        (c) => `- Component ${c.name}: ${c.description}`,
      ),
    );
  }

  sections.push(
    "",
    "Required AGENTS.md sections:",
    "# AGENTS.md — {title}",
    "## Mission",
    "## Constraints",
    "## Tech stack",
    "## MVP scope (build only this)",
    "## Architecture reference",
    "## Design system",
    "## Build phases & prompts",
    "## Agent stack (if applicable)",
    "## Monetization & risks",
  );

  return sections.join("\n");
}
