"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaintGridLines } from "@/components/marketing/faint-grid-lines";
import { MarketingDarkAmbientBg } from "@/components/marketing/marketing-dark-ambient-bg";
import { cn } from "@/lib/utils";

const DARK_FOOTER_PATHS = ["/", "/about", "/docs"];

export function SiteFooter() {
  const pathname = usePathname();
  const isDarkFooter = DARK_FOOTER_PATHS.includes(pathname);

  return (
    <footer
      className={cn(
        "relative overflow-hidden border-t",
        isDarkFooter
          ? "border-zinc-800/80 bg-marketing-dark-surface"
          : "border-zinc-200/40 bg-zinc-50/40 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-950/40",
      )}
    >
      {isDarkFooter && (
        <>
          <MarketingDarkAmbientBg />
          <FaintGridLines tone="dark" className="z-[1]" />
        </>
      )}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p
            className={cn(
              "font-semibold",
              isDarkFooter ? "text-zinc-100" : "text-zinc-900 dark:text-zinc-50",
            )}
          >
            What Should I Build?
          </p>
          <p
            className={cn(
              "mt-1 text-sm",
              isDarkFooter ? "text-zinc-500" : "text-zinc-600 dark:text-zinc-400",
            )}
          >
            AI project idea generator for developers.
          </p>
        </div>
        <nav
          className={cn(
            "flex flex-wrap gap-x-6 gap-y-2 text-sm",
            isDarkFooter ? "text-zinc-500" : "text-zinc-600 dark:text-zinc-400",
          )}
        >
          <Link
            href="/"
            className={
              isDarkFooter
                ? "hover:text-zinc-200"
                : "hover:text-zinc-900 dark:hover:text-zinc-200"
            }
          >
            Home
          </Link>
          <Link
            href="/about"
            className={
              isDarkFooter
                ? "hover:text-zinc-200"
                : "hover:text-zinc-900 dark:hover:text-zinc-200"
            }
          >
            About
          </Link>
          <Link
            href="/docs"
            className={
              isDarkFooter
                ? "hover:text-zinc-200"
                : "hover:text-zinc-900 dark:hover:text-zinc-200"
            }
          >
            Docs
          </Link>
        </nav>
      </div>
      <div
        className={cn(
          "relative border-t px-4 py-4 text-center text-xs sm:px-6",
          isDarkFooter
            ? "border-zinc-800/80 text-zinc-600"
            : "border-zinc-200/40 text-zinc-500 dark:border-zinc-800/50 dark:text-zinc-400",
        )}
      >
        <p className="flex items-center justify-center">
          <span>Built By</span>
          <a
            href="https://github.com/rkvishwa"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "ml-1 font-medium transition-colors sm:ml-1.5",
              isDarkFooter
                ? "text-zinc-400 hover:text-zinc-200"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200",
            )}
          >
            RKK Vishva Kumar
          </a>
        </p>
      </div>
    </footer>
  );
}
