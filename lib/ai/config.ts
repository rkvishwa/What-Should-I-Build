export type LlmConfig = {
  apiKey: string;
  baseURL: string;
};

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

export function getLlmConfig(): LlmConfig | null {
  const apiKey = process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY;

  if (!apiKey?.trim()) {
    return null;
  }

  return {
    apiKey: apiKey.trim(),
    baseURL: process.env.LLM_BASE_URL?.trim() || DEFAULT_BASE_URL,
  };
}

export function assertLlmConfig(): LlmConfig {
  const config = getLlmConfig();

  if (!config) {
    throw new Error(
      "LLM is not configured. Set LLM_API_KEY (or OPENAI_API_KEY) in your environment.",
    );
  }

  return config;
}
