export const MODEL_TIER_STORAGE_KEY = "wsib-model-tier";

export type ModelTier = "fast" | "advanced";

export const MODEL_TIER_LABELS: Record<ModelTier, string> = {
  fast: "Fast",
  advanced: "Advanced",
};

export const MODEL_TIER_IDS: Record<ModelTier, string> = {
  fast: "gpt-4.1",
  advanced: "gpt-5.5",
};

export const DEFAULT_MODEL_TIER: ModelTier = "fast";

export function resolveModelId(tier: ModelTier): string {
  return MODEL_TIER_IDS[tier];
}

export function parseModelTier(value: unknown): ModelTier {
  if (value === "fast" || value === "advanced") {
    return value;
  }
  return DEFAULT_MODEL_TIER;
}

export function getModelTierFromInput(input: {
  modelTier?: ModelTier | null;
}): ModelTier {
  return parseModelTier(input.modelTier);
}
