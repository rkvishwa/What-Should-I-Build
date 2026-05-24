import { LandingHero } from "@/components/marketing/landing-hero";
import { HeroDivider } from "@/components/marketing/hero-divider";
import { LandingFeatures } from "@/components/marketing/landing-features";
import { LandingHowItWorks } from "@/components/marketing/landing-how-it-works";
import { LandingUseCases } from "@/components/marketing/landing-use-cases";
import { LandingCta } from "@/components/marketing/landing-cta";
import { MarketingDarkShell } from "@/components/marketing/marketing-dark-shell";
import { MarketingDarkAmbientBg } from "@/components/marketing/marketing-dark-ambient-bg";
import { FaintGridLines } from "@/components/marketing/faint-grid-lines";

export default function HomePage() {
  return (
    <main className="relative">
      <LandingHero />
      <div className="relative overflow-hidden bg-marketing-dark-surface text-zinc-100">
        <MarketingDarkAmbientBg />
        <FaintGridLines tone="dark" className="z-[1]" />
        <div className="relative z-10">
          <HeroDivider />
          <MarketingDarkShell embedded>
            <LandingFeatures />
            <LandingHowItWorks />
            <LandingUseCases />
            <LandingCta />
          </MarketingDarkShell>
        </div>
      </div>
    </main>
  );
}
