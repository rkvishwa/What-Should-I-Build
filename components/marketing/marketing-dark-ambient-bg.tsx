import { cn } from "@/lib/utils";

type MarketingDarkAmbientBgProps = {
  className?: string;
};

export function MarketingDarkAmbientBg({
  className,
}: MarketingDarkAmbientBgProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="animate-gradient-drift absolute -left-[14%] top-[0%] h-[min(480px,46vh)] w-[min(640px,58vw)] rounded-full bg-[var(--marketing-dark-glow-a)] blur-[115px] opacity-85" />
      <div className="animate-gradient-drift-reverse absolute -right-[10%] top-[8%] h-[min(420px,40vh)] w-[min(560px,50vw)] rounded-full bg-[var(--marketing-dark-glow-b)] blur-[105px] opacity-80" />
      <div className="animate-gradient-drift-slow absolute left-[30%] top-[18%] h-[min(380px,36vh)] w-[min(500px,46vw)] rounded-full bg-[var(--marketing-dark-glow-c)] blur-[120px] opacity-75" />

      <div
        className="animate-gradient-drift-alt absolute -right-[16%] top-[32%] h-[min(440px,42vh)] w-[min(540px,48vw)] rounded-full bg-[var(--marketing-dark-glow-b)] blur-[100px] opacity-75"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="animate-gradient-drift absolute left-[4%] top-[44%] h-[min(400px,38vh)] w-[min(520px,47vw)] rounded-full bg-[var(--marketing-dark-glow-a)] blur-[110px] opacity-70"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="animate-gradient-drift-reverse absolute right-[6%] top-[58%] h-[min(460px,44vh)] w-[min(560px,50vw)] rounded-full bg-[var(--marketing-dark-glow-c)] blur-[108px] opacity-72"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="animate-gradient-drift-slow absolute -left-[6%] top-[72%] h-[min(420px,40vh)] w-[min(500px,46vw)] rounded-full bg-[var(--marketing-dark-glow-b)] blur-[112px] opacity-68"
        style={{ animationDelay: "-10s" }}
      />
      <div
        className="animate-gradient-drift-alt absolute left-[38%] top-[84%] h-[min(360px,34vh)] w-[min(480px,44vw)] rounded-full bg-[var(--marketing-dark-glow-a)] blur-[98px] opacity-65"
        style={{ animationDelay: "-12s" }}
      />

      <div className="absolute inset-0 bg-[length:24px_24px] bg-[radial-gradient(circle,_rgb(194_65_12_/_0.055)_1px,_transparent_1px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,var(--marketing-dark-ambient),transparent_65%)]" />
      <div className="absolute inset-0 bg-marketing-dark-surface/25" />
    </div>
  );
}
