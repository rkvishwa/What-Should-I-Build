import type { FormInput } from "@/lib/schemas/form-input";
import type { Idea } from "@/lib/schemas/idea-output";
import type { CanvasData } from "@/lib/schemas/canvas";

export function buildAgentMdFallback(
  input: FormInput,
  idea: Idea,
  canvas: CanvasData | null,
): string {
  const lines: string[] = [
    `# AGENTS.md — ${idea.title}`,
    "",
    "## Mission",
    "",
    idea.pitch,
    "",
    idea.whyItFits,
    "",
    "## Constraints",
    "",
  ];

  if (input.timeAvailable?.trim()) {
    lines.push(`- **Time budget:** ${input.timeAvailable.trim()}`);
  }
  lines.push(
    `- **Build approach:** ${input.agenticCoding ? "Agentic coding with AI agents" : "Traditional development"}`,
    `- **AI in product:** ${input.aiInProduct ? "Allowed — may include AI features" : "FORBIDDEN — no LLMs, chatbots, or ML in the product"}`,
  );

  if (input.skills?.length) {
    lines.push(`- **User skills:** ${input.skills.join(", ")}`);
  }

  lines.push(
    "",
    "## Tech stack",
    "",
    ...idea.stack.technologies.map((t) => `- ${t}`),
    "",
    idea.stack.rationale,
    "",
    "## MVP scope (build only this)",
    "",
    "**Must have:**",
    ...idea.mvpScope.mustHave.map((item) => `- ${item}`),
    "",
    "**Out of scope for MVP (cut for later):**",
    ...idea.mvpScope.cutForLater.map((item) => `- ${item}`),
    "",
    "## Architecture reference",
    "",
  );

  if (canvas) {
    lines.push(
      `${canvas.architecture.nodes.length} nodes, ${canvas.architecture.edges.length} edges.`,
      "",
      ...canvas.architecture.nodes.map(
        (n) => `- \`${n.id}\` (${n.type}): ${n.data.label}`,
      ),
    );
  } else {
    lines.push(
      "Architecture canvas not yet generated. Start with a simple client + API + database layout matching the stack above.",
    );
  }

  lines.push("", "## Design system", "");

  if (canvas) {
    const { designSystem } = canvas;
    lines.push("**Colors:**");
    for (const c of designSystem.tokens.colors) {
      lines.push(`- ${c.name}: \`${c.value}\``);
    }
    lines.push("", "**Typography:**");
    for (const t of designSystem.tokens.typography) {
      lines.push(`- ${t.name}: ${t.value}`);
    }
    lines.push("", "**Components:**");
    for (const c of designSystem.components) {
      lines.push(`- **${c.name}:** ${c.description} (variants: ${c.variants.join(", ")})`);
    }
  } else {
    lines.push(
      "Use Tailwind CSS with a clean, modern aesthetic. Define primary/secondary colors and consistent spacing before building UI.",
    );
  }

  lines.push("", "## Build phases & prompts", "");

  for (const phase of idea.roadmap) {
    lines.push(`### ${phase.phase}`, "");
    for (const goal of phase.goals) {
      lines.push(`- ${goal}`);
    }
    lines.push(
      "",
      `**Agent prompt:** Implement the "${phase.phase}" phase for ${idea.title}. Goals: ${phase.goals.join("; ")}. Ship only MVP must-haves. Stack: ${idea.stack.technologies.join(", ")}.`,
      "",
    );
  }

  if (idea.agentStack) {
    lines.push(
      "## Agent stack",
      "",
      `- **Model:** ${idea.agentStack.model}`,
      `- **Orchestration:** ${idea.agentStack.orchestration}`,
      `- **Tools:** ${idea.agentStack.tools.join(", ")}`,
      "",
    );
  }

  lines.push(
    "## Monetization & risks",
    "",
    "**Monetization:**",
    ...idea.monetization.map((m) => `- ${m}`),
    "",
    "**Risks & notes:**",
    "",
    idea.metaNotes,
  );

  return lines.join("\n");
}
