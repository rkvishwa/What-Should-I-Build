import { cn } from "@/lib/utils";

type LandingSectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  tone?: "light" | "dark";
};

export function LandingSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  headerClassName,
  tone = "light",
}: LandingSectionProps) {
  const isDark = tone === "dark";

  return (
    <section id={id} className={cn("relative py-24 sm:py-32", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {(eyebrow || title || description) && (
          <div className={cn("max-w-2xl", headerClassName)}>
            {eyebrow && (
              <p
                className={cn(
                  "mb-3 font-mono text-xs uppercase tracking-widest",
                  isDark ? "text-zinc-500" : "text-zinc-600 dark:text-zinc-400",
                )}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className={cn(
                  "text-3xl font-bold tracking-tight sm:text-4xl",
                  isDark ? "text-zinc-50" : "text-zinc-900 dark:text-zinc-50",
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={cn(
                  "mt-4 text-lg leading-relaxed",
                  isDark ? "text-zinc-400" : "text-zinc-700 dark:text-zinc-300",
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
