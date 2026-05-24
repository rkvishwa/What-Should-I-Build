import { generateObject } from "ai";
import type { FormInput } from "@/lib/schemas/form-input";
import { getIdeaCount } from "@/lib/schemas/form-input";
import {
  buildIdeaOutputSchema,
  type IdeaOutput,
} from "@/lib/schemas/idea-output";
import type { GitHubSummary } from "@/lib/github/fetch-profile";
import { getLanguageModel } from "./client";
import { getModelTierFromInput } from "./model-tiers";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";

export async function generateIdeas(
  input: FormInput,
  githubSummary: GitHubSummary | null,
): Promise<IdeaOutput> {
  const ideaCount = getIdeaCount(input);
  const schema = buildIdeaOutputSchema(ideaCount);

  const { object } = await generateObject({
    model: getLanguageModel(getModelTierFromInput(input)),
    schema,
    system: buildSystemPrompt(input, ideaCount),
    prompt: buildUserPrompt(input, githubSummary, ideaCount),
  });

  return object as IdeaOutput;
}
