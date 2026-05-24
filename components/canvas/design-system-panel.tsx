"use client";

import type { CanvasData } from "@/lib/schemas/canvas";
import { Badge, Card } from "@/components/ui";

export function DesignSystemPanel({ canvas }: { canvas: CanvasData }) {
  const { tokens, components } = canvas.designSystem;

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4">
      <div className="space-y-4">
        <section>
          <h3 className="mb-2 text-sm font-semibold">Colors</h3>
          <div className="space-y-2">
            {tokens.colors.map((c) => (
              <div key={c.name} className="flex flex-wrap items-center gap-2">
                <span
                  className="h-6 w-6 shrink-0 rounded border border-zinc-200"
                  style={{ backgroundColor: c.value }}
                />
                <span className="text-sm">{c.name}</span>
                <Badge className="max-w-full truncate">{c.value}</Badge>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Typography</h3>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {tokens.typography.map((t) => (
              <li key={t.name}>
                <strong>{t.name}:</strong> {t.value}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Spacing & Radius</h3>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {[...tokens.spacing, ...tokens.radius].map((t) => (
              <li key={t.name}>
                <strong>{t.name}:</strong> {t.value}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Components</h3>
          <div className="space-y-2">
            {components.map((c) => (
              <Card key={c.name} className="p-3">
                <p className="font-medium">{c.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{c.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.variants.map((v) => (
                    <Badge key={v}>{v}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
