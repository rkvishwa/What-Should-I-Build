import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        )}
      </div>
      <div className="relative h-6 w-11 shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className={cn(
            "absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100",
            checked ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-300 dark:bg-zinc-700",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform dark:bg-zinc-900",
            checked && "translate-x-5",
          )}
        />
      </div>
    </div>
  );
}
