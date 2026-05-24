"use client";

import { ChevronDown } from "lucide-react";
import { MODEL_TIER_LABELS, type ModelTier } from "@/lib/ai/model-tiers";
import { useModelTier } from "@/lib/client/model-tier-context";
import { cn } from "@/lib/utils";

type ModelTierSelectProps = {
  className?: string;
  compact?: boolean;
};

export function ModelTierSelect({ className, compact }: ModelTierSelectProps) {
  const { modelTier, setModelTier } = useModelTier();

  return (
    <div className={cn("relative", className)}>
      <label htmlFor="model-tier" className="sr-only">
        Model speed
      </label>
      <select
        id="model-tier"
        value={modelTier}
        onChange={(event) => setModelTier(event.target.value as ModelTier)}
        className={cn(
          "appearance-none rounded-lg border border-zinc-300 bg-white pl-3 pr-8 text-sm font-medium text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100",
          compact ? "h-9 py-1.5" : "h-10 py-2",
        )}
        aria-label="Select model speed"
      >
        {(Object.keys(MODEL_TIER_LABELS) as ModelTier[]).map((tier) => (
          <option key={tier} value={tier}>
            {MODEL_TIER_LABELS[tier]}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
        aria-hidden
      />
    </div>
  );
}
