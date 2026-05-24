import { z } from "zod";

export const roadmapPhaseSchema = z.object({
  phase: z.string(),
  goals: z.array(z.string()),
});

export const agentStackSchema = z.object({
  model: z.string(),
  orchestration: z.string(),
  tools: z.array(z.string()),
});

export const ideaRoleSchema = z.enum(["closest", "variation", "adjacent"]);

const baseIdeaSchema = z.object({
  rank: z.number().int().min(1),
  ideaRole: ideaRoleSchema.nullable(),
  title: z.string(),
  pitch: z.string(),
  whyItFits: z.string(),
  stack: z.object({
    technologies: z.array(z.string()),
    rationale: z.string(),
  }),
  agentStack: agentStackSchema.nullable(),
  mvpScope: z.object({
    mustHave: z.array(z.string()),
    cutForLater: z.array(z.string()),
  }),
  roadmap: z.array(roadmapPhaseSchema),
  monetization: z.array(z.string()),
  metaNotes: z.string(),
});

export const ideaSchema = baseIdeaSchema;

const summarySchema3 = z.object({
  bestPick: z.string(),
  fastestToShip: z.string(),
  highestUpside: z.string(),
});

const summarySchema5 = summarySchema3.extend({
  mostAligned: z.string(),
});

export function buildIdeaOutputSchema(count: 3 | 5) {
  return z.object({
    summary: count === 5 ? summarySchema5 : summarySchema3,
    ideas: z.array(baseIdeaSchema).length(count),
  });
}

export const ideaOutputSchema = buildIdeaOutputSchema(3);

export type IdeaOutput = z.infer<typeof ideaOutputSchema>;
export type IdeaOutput5 = z.infer<ReturnType<typeof buildIdeaOutputSchema>>;
export type Idea = z.infer<typeof ideaSchema>;
export type AgentStack = z.infer<typeof agentStackSchema>;
export type IdeaRole = z.infer<typeof ideaRoleSchema>;
