import { cn } from "@/lib/utils";

type FaintGridLinesProps = {
  className?: string;
  tone?: "light" | "dark";
};

export function FaintGridLines({
  className,
  tone = "light",
}: FaintGridLinesProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0",
        tone === "dark" ? "bg-marketing-faint-grid-dark" : "bg-marketing-faint-grid",
        className,
      )}
      aria-hidden
    />
  );
}
