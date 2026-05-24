import { FaintGridLines } from "@/components/marketing/faint-grid-lines";
import { MarketingDarkAmbientBg } from "@/components/marketing/marketing-dark-ambient-bg";
import { cn } from "@/lib/utils";

type MarketingDarkShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Skip outer chrome when nested inside a parent dark zone (e.g. home page). */
  embedded?: boolean;
};

export function MarketingDarkShell({
  children,
  className,
  embedded = false,
}: MarketingDarkShellProps) {
  if (embedded) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "relative min-h-full bg-marketing-dark-surface text-zinc-100",
        className,
      )}
    >
      <MarketingDarkAmbientBg />
      <FaintGridLines tone="dark" className="z-[1]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
