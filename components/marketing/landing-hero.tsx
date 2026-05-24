import Link from "next/link";
import { AuthCta } from "@/components/marketing/auth-cta";
import { HeroAmbientBg } from "@/components/marketing/hero-ambient-bg";
import { LandingHeroPreview } from "@/components/marketing/landing-hero-preview";
import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <HeroAmbientBg />
      <div
        className="pointer-events-none absolute inset-0 bg-zinc-50/55 dark:bg-zinc-950/60"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl lg:max-w-none">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              AI project idea generator
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
              What Should I Build?
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-xl">
              Tell us your skills, GitHub, time, and career goals — or drop any
              context like a hackathon theme. Get a roadmap, stack, MVP scope,
              monetization paths, and an interactive workspace to ship from.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <AuthCta size="lg" />
              <Link
                href="/docs"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Read the docs
              </Link>
            </div>
          </div>

          <LandingHeroPreview />
        </div>
      </div>
    </section>
  );
}
