import type { FormInput } from "@/lib/schemas/form-input";
import type { IdeaOutput } from "@/lib/schemas/idea-output";

export function generationToMarkdown(
  input: FormInput,
  output: IdeaOutput,
): string {
  const lines: string[] = [
    "# What Should I Build?",
    "",
    "## Your inputs",
  ];

  if (input.skills?.length) {
    lines.push(`- **Skills:** ${input.skills.join(", ")}`);
  }
  if (input.githubUsername?.trim()) {
    lines.push(`- **GitHub:** ${input.githubUsername.trim()}`);
  }
  if (input.timeAvailable?.trim()) {
    lines.push(`- **Time:** ${input.timeAvailable.trim()}`);
  }
  if (input.careerGoals?.trim()) {
    lines.push(`- **Career goals:** ${input.careerGoals.trim()}`);
  }
  if (input.seedIdea?.trim()) {
    lines.push(`- **Seed idea:** ${input.seedIdea.trim()}`);
  }
  if (input.context?.trim()) {
    lines.push(`- **Context:** ${input.context.trim()}`);
  }

  lines.push("", "## Summary", "");
  lines.push(`- **Best pick:** ${output.summary.bestPick}`);
  lines.push(`- **Fastest to ship:** ${output.summary.fastestToShip}`);
  lines.push(`- **Highest upside:** ${output.summary.highestUpside}`);
  if ("mostAligned" in output.summary && output.summary.mostAligned) {
    lines.push(`- **Most aligned:** ${output.summary.mostAligned}`);
  }
  lines.push("");

  for (const idea of output.ideas) {
    lines.push(`## ${idea.rank}. ${idea.title}`, "", idea.pitch, "");
    lines.push("### Why it fits", "", idea.whyItFits, "");
    lines.push(
      "### Stack",
      "",
      idea.stack.technologies.map((t) => `- ${t}`).join("\n"),
      "",
      idea.stack.rationale,
      "",
    );
    lines.push(
      "### MVP scope",
      "",
      "**Must have:**",
      ...idea.mvpScope.mustHave.map((item) => `- ${item}`),
      "",
      "**Cut for later:**",
      ...idea.mvpScope.cutForLater.map((item) => `- ${item}`),
      "",
    );
    lines.push("### Roadmap", "");
    for (const phase of idea.roadmap) {
      lines.push(`**${phase.phase}**`);
      for (const goal of phase.goals) {
        lines.push(`- ${goal}`);
      }
      lines.push("");
    }
    lines.push(
      "### Monetization",
      "",
      ...idea.monetization.map((m) => `- ${m}`),
      "",
    );
    lines.push("### Meta notes", "", idea.metaNotes, "");
  }

  return lines.join("\n");
}
