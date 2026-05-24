import type { FormInput } from "@/lib/schemas/form-input";
import type { GitHubSummary } from "@/lib/github/fetch-profile";

function formatProfile(input: FormInput): string {
  const lines: string[] = [];

  if (input.agenticCoding) {
    lines.push("Build approach: Agentic coding (user builds with AI coding agents)");
  }

  if (input.skills?.length) {
    lines.push(`Skills: ${input.skills.join(", ")}`);
  } else if (input.agenticCoding) {
    lines.push("Skills: Not specified (agentic coding enabled — agents can use any stack)");
  }

  if (input.githubUsername?.trim()) {
    lines.push(`GitHub username: ${input.githubUsername.trim()}`);
  }

  if (input.timeAvailable?.trim()) {
    lines.push(`Time available: ${input.timeAvailable.trim()}`);
  }

  if (input.careerGoals?.trim()) {
    lines.push(`Career goals: ${input.careerGoals.trim()}`);
  }

  lines.push(
    `AI in product: ${input.aiInProduct ? "Yes — ideas may include AI/agent features" : "No — product must NOT use AI, LLMs, chatbots, or agents"}`,
  );

  return lines.join("\n");
}

function formatSeedAndAttachments(input: FormInput): string {
  const sections: string[] = [];

  if (input.seedIdea?.trim()) {
    sections.push(
      `Seed idea (anchor all output to this):\n${input.seedIdea.trim()}`,
    );
  }

  if (input.attachments?.length) {
    const extracts = input.attachments
      .map((a) => `- ${a.filename}: ${a.extractedText}`)
      .join("\n");
    sections.push(`Uploaded file extracts:\n${extracts}`);
  }

  return sections.join("\n\n");
}

export function buildSystemPrompt(input: FormInput, ideaCount: 3 | 5): string {
  const rules = [
    "You are an expert indie developer mentor who suggests concrete, buildable side projects.",
    `- Return exactly ${ideaCount} ranked project ideas (rank 1 = best overall fit).`,
    "- Match ideas to the user's stated time budget. Never suggest a multi-month platform for a weekend.",
    "- Monetization must be realistic for solo developers — not 'become the next unicorn.'",
    "- Be specific: name features, not vague categories.",
    "- Roadmap phases should be actionable (week 1, weeks 2-4, post-MVP).",
    "- Meta notes should cover risks, differentiation, build-in-public angle, and learning value.",
    "- Set ideaRole to null when not using anchored mode (3 ideas). Set agentStack to null when the product has no AI.",
  ];

  if (ideaCount === 3) {
    rules.push(
      "- Include at least one lower-risk, faster-to-ship idea among the three.",
    );
  }

  if (ideaCount === 5) {
    rules.push(
      "- ANCHORED MODE: User provided a seed idea and/or uploaded files. All ideas must trace back to that source in whyItFits.",
      "- Rank 1 (ideaRole: closest): closest faithful interpretation of the seed/source.",
      "- Ranks 2-4 (ideaRole: variation): variations/extensions — different scope, audience, or MVP cut of the core concept.",
      "- Rank 5 (ideaRole: adjacent): adjacent idea in the same problem space but meaningfully different product.",
      "- Summary must include mostAligned referencing rank 1's title.",
    );
  }

  if (input.agenticCoding) {
    rules.push(
      "- The user builds with AI coding agents (Cursor, Copilot, etc.). Skills are optional — suggest ambitious but time-bounded ideas agents can scaffold.",
    );
  } else {
    rules.push(
      "- Prefer stacks that overlap the user's skills unless they explicitly want to learn something new.",
    );
  }

  if (input.aiInProduct) {
    rules.push(
      "- AI in product is ENABLED. At least one idea should leverage AI/agents. Set agentStack on ideas that use AI; null otherwise.",
    );
  } else {
    rules.push(
      "- AI in product is DISABLED. Do NOT suggest chatbots, LLM APIs, AI assistants, ML models, or agent workflows. Set agentStack to null on every idea.",
    );
  }

  return rules.join("\n");
}

export function buildUserPrompt(
  input: FormInput,
  githubSummary: GitHubSummary | null,
  ideaCount: 3 | 5,
): string {
  const sections: string[] = [`Input mode: ${input.mode}`];

  const seedBlock = formatSeedAndAttachments(input);
  if (seedBlock) {
    sections.push(seedBlock);
  }

  if (input.mode === "profile" || input.mode === "both") {
    const profile = formatProfile(input);
    if (profile) {
      sections.push("Developer profile:\n" + profile);
    }
  }

  if (input.mode === "context" || input.mode === "both") {
    if (input.context?.trim()) {
      sections.push("Freeform context:\n" + input.context.trim());
    }
  }

  if (githubSummary) {
    sections.push("GitHub profile summary:\n" + githubSummary.summaryText);
  }

  if (ideaCount === 5) {
    sections.push(
      "Generate 5 anchored project ideas with ideaRole set correctly (closest, variation, adjacent). Include full roadmap, stack, MVP scope, monetization, meta notes. Summary must include bestPick, fastestToShip, highestUpside, and mostAligned.",
    );
  } else {
    sections.push(
      "Generate 3 project ideas with full roadmap, stack, MVP scope, monetization paths, and meta notes. Include a summary with bestPick, fastestToShip, and highestUpside referencing the idea titles. Set ideaRole to null on all ideas.",
    );
  }

  return sections.join("\n\n");
}

export function buildCanvasSystemPrompt(input: FormInput): string {
  const rules = [
    "You generate React Flow architecture diagrams and design system specs for a software project.",
    "Use deterministic kebab-case node IDs (e.g. api-gateway, auth-service, postgres-db).",
    "Node types: service, database, api, ui, user, agent, model, designToken, component.",
    "Architecture nodes: 5-15 nodes showing data flow. Include user node.",
    "Design system: 3-5 colors, 2-3 typography tokens, 2-3 spacing, 1-2 radius, 3-5 components.",
    "Position nodes in a logical grid (x: 0-800, y: 0-600).",
    "Use an empty string for node descriptions and edge labels when none is needed.",
  ];

  if (!input.aiInProduct) {
    rules.push(
      "Do NOT include agent or model nodes — the product has no AI features.",
    );
  } else {
    rules.push("Include agent and/or model nodes where AI features exist.");
  }

  return rules.join("\n");
}

export function buildCanvasUserPrompt(idea: {
  title: string;
  pitch: string;
  stack: { technologies: string[] };
}): string {
  return `Generate architecture canvas and design system for:

Title: ${idea.title}
Pitch: ${idea.pitch}
Stack: ${idea.stack.technologies.join(", ")}

Return architecture nodes/edges and designSystem tokens/components.`;
}

export function buildValidationSystemPrompt(input: FormInput): string {
  return `You validate software architecture diagrams for consistency and best practices.
Return issues with nodeId (null if not tied to a node), severity (error/warning/info), and message.
Check: orphan nodes, missing auth on sensitive flows, circular dependencies, AI nodes when AI is ${input.aiInProduct ? "allowed" : "FORBIDDEN"}, missing database for data-heavy apps.`;
}

export function buildChatSystemPrompt(input: FormInput): string {
  return `You are a project mentor helping refine a specific project idea, its architecture canvas, and design system.
Workspace context: agentic coding=${input.agenticCoding}, AI in product=${input.aiInProduct}.
Be concise and actionable. You may suggest canvas changes when asked.`;
}
