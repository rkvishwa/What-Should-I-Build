import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  showWordmark?: boolean;
  compact?: boolean;
};

export function SiteLogo({
  className,
  showWordmark = true,
  compact = false,
}: SiteLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center text-zinc-900 dark:text-zinc-50",
        compact ? "gap-2" : "gap-2.5",
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={cn("shrink-0", compact ? "h-6 w-6" : "h-7 w-7")}
      >
        <path
          d="M12 19V11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 11L7.5 5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 11L16.5 5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="11" r="1.75" fill="currentColor" />
        <path
          d="M12 2.5v2M10.5 4h3"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="stroke-zinc-500 dark:stroke-zinc-400"
        />
      </svg>
      {showWordmark && (
        <span
          className={cn(
            "font-mono font-semibold tracking-tight whitespace-nowrap",
            compact ? "text-xs leading-tight" : "text-sm sm:text-base",
          )}
        >
          What Should I <span className="font-bold">Build?</span>
        </span>
      )}
    </span>
  );
}
