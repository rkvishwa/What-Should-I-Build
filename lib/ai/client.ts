import { createOpenAI } from "@ai-sdk/openai";
import {
  DEFAULT_MODEL_TIER,
  resolveModelId,
  type ModelTier,
} from "./model-tiers";
import { assertLlmConfig } from "./config";

export function getLanguageModel(tier: ModelTier = DEFAULT_MODEL_TIER) {
  const config = assertLlmConfig();

  const provider = createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  return provider(resolveModelId(tier));
}
