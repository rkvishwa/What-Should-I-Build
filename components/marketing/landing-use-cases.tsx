import { LandingSection } from "@/components/marketing/landing-section";

const USE_CASES = [
  {
    label: "Weekend MVP",
    prompt:
      "I know React and Node. I have one weekend. I want something I can demo on Monday.",
    tags: ["React", "Node.js", "1 weekend"],
  },
  {
    label: "Hackathon: AI + health",
    prompt:
      "48-hour hackathon. Theme: preventive health. I want AI features in the product itself.",
    tags: ["Hackathon", "AI in product", "48 hours"],
  },
  {
    label: "Agentic build",
    prompt:
      "Build with Cursor agents over 2 weeks. Any stack. Skills optional — just ship.",
    tags: ["Agentic coding", "2 weeks", "Any stack"],
  },
];

export function LandingUseCases() {
  return (
    <LandingSection
      tone="dark"
      eyebrow="Use cases"
      title="Built for how you actually build"
      description="Side projects, hackathons, career pivots — start from a profile, a theme, or both."
    >
      <div className="mt-16 space-y-10">
        {USE_CASES.map((useCase, index) => (
          <div
            key={useCase.label}
            className="grid gap-4 border-l border-zinc-800 pl-4 sm:grid-cols-[200px_1fr] sm:gap-10 sm:pl-8 lg:grid-cols-[240px_1fr]"
          >
            <div className="pt-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                Scenario {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 text-lg font-semibold text-zinc-100">
                {useCase.label}
              </h3>
            </div>

            <div>
              <div className="relative rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-4 sm:px-5 sm:py-5">
                <span className="absolute left-4 top-4 font-mono text-marketing-accent sm:left-5 sm:top-5">
                  ›
                </span>
                <p className="pl-4 font-mono text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
                  {useCase.prompt}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {useCase.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] text-zinc-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
