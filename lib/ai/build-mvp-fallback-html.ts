import type { Idea } from "@/lib/schemas/idea-output";
import type { CanvasData } from "@/lib/schemas/canvas";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildMvpFallbackHtml(
  idea: Idea,
  canvas: CanvasData | null,
): string {
  const primary =
    canvas?.designSystem.tokens.colors.find((c) =>
      c.name.toLowerCase().includes("primary"),
    )?.value ?? "#18181b";
  const background =
    canvas?.designSystem.tokens.colors.find((c) =>
      c.name.toLowerCase().includes("background"),
    )?.value ?? "#fafafa";
  const font =
    canvas?.designSystem.tokens.typography[0]?.value ??
    "ui-sans-serif, system-ui, sans-serif";

  const mustHave = idea.mvpScope.mustHave
    .map(
      (item) =>
        `<li style="padding:12px 16px;background:#fff;border:1px solid #e4e4e7;border-radius:10px;">${escapeHtml(item)}</li>`,
    )
    .join("");

  const cutForLater = idea.mvpScope.cutForLater
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(idea.title)}</title>
</head>
<body style="margin:0;font-family:${font};background:${background};color:#18181b;">
  <header style="padding:24px 20px;border-bottom:1px solid #e4e4e7;background:#fff;">
    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">MVP preview</p>
    <h1 style="margin:0 0 8px;font-size:28px;line-height:1.2;">${escapeHtml(idea.title)}</h1>
    <p style="margin:0;max-width:640px;color:#52525b;line-height:1.6;">${escapeHtml(idea.pitch)}</p>
  </header>
  <main style="max-width:960px;margin:0 auto;padding:24px 20px 40px;">
    <section style="margin-bottom:28px;">
      <h2 style="margin:0 0 12px;font-size:18px;">Must-have features</h2>
      <ul style="margin:0;padding:0;list-style:none;display:grid;gap:10px;">${mustHave}</ul>
    </section>
    <section style="margin-bottom:28px;padding:20px;border:1px dashed #d4d4d8;border-radius:12px;background:#fff;">
      <h2 style="margin:0 0 12px;font-size:16px;color:#71717a;">Prototype shell</h2>
      <p style="margin:0 0 16px;color:#52525b;line-height:1.6;">Interactive UI preview is temporarily unavailable. This scaffold reflects the MVP scope from your agent spec.</p>
      <button type="button" style="padding:10px 16px;border:none;border-radius:8px;background:${primary};color:#fff;font-weight:600;cursor:pointer;">Primary action</button>
    </section>
    <section>
      <h2 style="margin:0 0 8px;font-size:14px;color:#71717a;">Cut for later</h2>
      <ul style="margin:0;padding-left:18px;color:#71717a;line-height:1.7;">${cutForLater}</ul>
    </section>
  </main>
</body>
</html>`;
}
