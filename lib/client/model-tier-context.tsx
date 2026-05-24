"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_MODEL_TIER,
  MODEL_TIER_STORAGE_KEY,
  parseModelTier,
  type ModelTier,
} from "@/lib/ai/model-tiers";

type ModelTierContextValue = {
  modelTier: ModelTier;
  setModelTier: (tier: ModelTier) => void;
};

const ModelTierContext = createContext<ModelTierContextValue | null>(null);

function readStoredModelTier(): ModelTier {
  if (typeof window === "undefined") {
    return DEFAULT_MODEL_TIER;
  }
  return parseModelTier(localStorage.getItem(MODEL_TIER_STORAGE_KEY));
}

export function ModelTierProvider({ children }: { children: ReactNode }) {
  const [modelTier, setModelTierState] = useState<ModelTier>(DEFAULT_MODEL_TIER);

  useEffect(() => {
    setModelTierState(readStoredModelTier());
  }, []);

  const setModelTier = useCallback((tier: ModelTier) => {
    setModelTierState(tier);
    localStorage.setItem(MODEL_TIER_STORAGE_KEY, tier);
  }, []);

  return (
    <ModelTierContext.Provider value={{ modelTier, setModelTier }}>
      {children}
    </ModelTierContext.Provider>
  );
}

export function useModelTier(): ModelTierContextValue {
  const context = useContext(ModelTierContext);
  if (!context) {
    throw new Error("useModelTier must be used within ModelTierProvider");
  }
  return context;
}

export function readClientModelTier(): ModelTier {
  return readStoredModelTier();
}
