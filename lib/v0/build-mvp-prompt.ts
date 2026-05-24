import type { Idea } from "@/lib/schemas/idea-output";
import type { CanvasData } from "@/lib/schemas/canvas";

export function buildV0MvpPrompt({
  agentMd,
  idea,
  canvas,
}: {
  agentMd: string;
  idea: Idea;
  canvas: CanvasData | null;
}): string {
  const sections: string[] = [
    "Build a working MVP UI prototype based on the AGENTS.md specification below.",
    "",
    "Requirements:",
    "- Ship ONLY the must-have MVP features listed in AGENTS.md",
    "- Do NOT implement cut-for-later features",
    "- Use Next.js App Router + Tailwind CSS + shadcn-style components unless the stack says otherwise",
    "- Make it responsive and polished",
    "- Include realistic placeholder data where needed",
    "",
    `Project: ${idea.title}`,
    `Pitch: ${idea.pitch}`,
    "",
    "**MVP must-haves:**",
    ...idea.mvpScope.mustHave.map((item) => `- ${item}`),
    "",
    "**Do NOT build (cut for later):**",
    ...idea.mvpScope.cutForLater.map((item) => `- ${item}`),
  ];

  if (canvas) {
    const { designSystem } = canvas;
    sections.push(
      "",
      "**Design tokens to use:**",
      ...designSystem.tokens.colors.map((c) => `- ${c.name}: ${c.value}`),
      ...designSystem.tokens.typography.map(
        (t) => `- ${t.name}: ${t.value}`,
      ),
    );
  }

  sections.push(
    "",
    "---",
    "",
    "## AGENTS.md",
    "",
    agentMd,
  );

  return sections.join("\n");
}
