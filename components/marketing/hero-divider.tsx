import { cn } from "@/lib/utils";

const BARCODE_BARS = [
  { x: 1180, width: 2 },
  { x: 1183, width: 1 },
  { x: 1185, width: 3 },
  { x: 1189, width: 1 },
  { x: 1191, width: 2 },
  { x: 1194, width: 4 },
  { x: 1199, width: 1 },
  { x: 1201, width: 2 },
  { x: 1204, width: 1 },
  { x: 1206, width: 3 },
  { x: 1210, width: 2 },
  { x: 1213, width: 1 },
  { x: 1215, width: 4 },
  { x: 1220, width: 2 },
  { x: 1223, width: 1 },
  { x: 1225, width: 3 },
  { x: 1229, width: 1 },
  { x: 1231, width: 2 },
] as const;

const TAPE_TOP = 16;
const TAPE_BOTTOM = 104;
const TAPE_PATH = `M0 ${TAPE_TOP} H1440 V${TAPE_BOTTOM} H0 Z`;

function TapeChip({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-marketing-accent/70 bg-zinc-950/88 px-2.5 py-1.5 shadow-sm backdrop-blur-sm dark:bg-zinc-950/90",
        className,
      )}
    >
      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-marketing-accent sm:text-[9px]">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-[10px] font-semibold text-zinc-200 sm:text-[11px]">
        {value}
      </p>
    </div>
  );
}

function TapeStamp({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-marketing-accent/70 bg-zinc-950/85 dark:bg-zinc-950/90",
        className,
      )}
    >
      <span className="text-center font-mono text-[7px] font-bold uppercase leading-tight tracking-wide text-marketing-accent">
        Build
        <br />
        ready
      </span>
    </div>
  );
}

export function HeroDivider() {
  return (
    <div
      className="relative -mt-8 w-full overflow-hidden py-1 sm:-mt-12 sm:py-2"
      aria-hidden
    >
      <div className="relative">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="h-24 w-full sm:h-28 md:h-32 lg:h-36"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="masking-tape-stripes"
              width="18"
              height="18"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-40)"
            >
              <rect width="18" height="18" fill="#060403" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="18"
                stroke="#1a1810"
                strokeWidth="4"
                opacity="0.95"
              />
            </pattern>
            <pattern
              id="masking-tape-stripes-dark"
              width="18"
              height="18"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-40)"
            >
              <rect width="18" height="18" fill="#040302" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="18"
                stroke="#151210"
                strokeWidth="4"
                opacity="0.95"
              />
            </pattern>
            <linearGradient id="tape-shine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.1" />
              <stop offset="22%" stopColor="#9a3412" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="tape-shade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000" stopOpacity="0" />
              <stop offset="82%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.14" />
            </linearGradient>
            <linearGradient id="tape-shine-dark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.12" />
              <stop offset="22%" stopColor="#9a3412" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="tape-shade-dark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000" stopOpacity="0" />
              <stop offset="82%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.16" />
            </linearGradient>
          </defs>

          <path
            d={TAPE_PATH}
            fill="#000"
            opacity="0.18"
            transform="translate(0, 8)"
            className="dark:opacity-[0.24]"
          />

          <path
            d={TAPE_PATH}
            fill="#ea580c"
            opacity="0.06"
            className="dark:opacity-[0.08]"
          />

          <path
            d={TAPE_PATH}
            className="fill-[#060403] stroke-orange-600/30 dark:fill-[#040302] dark:stroke-orange-500/40"
            strokeWidth="1.5"
          />

          <path
            d={TAPE_PATH}
            fill="url(#masking-tape-stripes)"
            className="dark:fill-[url(#masking-tape-stripes-dark)]"
            opacity="0.96"
          />

          <path
            d={TAPE_PATH}
            fill="url(#tape-shine)"
            className="dark:fill-[url(#tape-shine-dark)]"
          />
          <path
            d={TAPE_PATH}
            fill="url(#tape-shade)"
            className="dark:fill-[url(#tape-shade-dark)]"
          />

          <path
            d="M24 60 H1416"
            stroke="#c2410c"
            strokeWidth="1"
            strokeDasharray="3 7"
            opacity="0.35"
            className="dark:stroke-orange-500/40"
          />

          <path
            d="M48 52 V68 M44 60 H52"
            stroke="#ea580c"
            strokeWidth="1"
            opacity="0.35"
            className="dark:opacity-40"
          />
          <path
            d="M1392 52 V68 M1388 60 H1396"
            stroke="#ea580c"
            strokeWidth="1"
            opacity="0.35"
            className="dark:opacity-40"
          />

          <g opacity="0.3" className="dark:opacity-35">
            {BARCODE_BARS.map((bar, index) => (
              <rect
                key={index}
                x={bar.x}
                y={42}
                width={bar.width}
                height={36}
                rx="0.5"
                className="fill-orange-500 dark:fill-orange-400"
              />
            ))}
          </g>

          <rect
            x="96"
            y="34"
            width="108"
            height="52"
            rx="4"
            fill="#09090b"
            fillOpacity="0.55"
            stroke="#c2410c"
            strokeWidth="1"
            strokeOpacity="0.25"
            className="dark:fill-zinc-950/50 dark:stroke-orange-600/35"
          />
          <rect
            x="560"
            y="36"
            width="96"
            height="48"
            rx="4"
            fill="#09090b"
            fillOpacity="0.45"
            stroke="#c2410c"
            strokeWidth="1"
            strokeOpacity="0.22"
            className="dark:fill-zinc-950/45 dark:stroke-orange-600/30"
          />
          <rect
            x="920"
            y="34"
            width="112"
            height="52"
            rx="4"
            fill="#09090b"
            fillOpacity="0.5"
            stroke="#c2410c"
            strokeWidth="1"
            strokeOpacity="0.24"
            className="dark:fill-zinc-950/48 dark:stroke-orange-600/32"
          />

          {[180, 640, 1040].map((cx) => (
            <circle
              key={cx}
              cx={cx}
              cy="60"
              r="3"
              className="fill-zinc-800 stroke-orange-600/45 dark:fill-zinc-900 dark:stroke-orange-500/50"
              strokeWidth="1"
            />
          ))}

          <line
            x1="0"
            y1={TAPE_TOP}
            x2="0"
            y2={TAPE_BOTTOM}
            className="stroke-orange-600/35 dark:stroke-orange-500/45"
            strokeWidth="1.25"
          />
          <line
            x1="1440"
            y1={TAPE_TOP}
            x2="1440"
            y2={TAPE_BOTTOM}
            className="stroke-orange-600/35 dark:stroke-orange-500/45"
            strokeWidth="1.25"
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-[4%] sm:px-[6%] md:px-[8%]">
          <TapeChip label="Project ref" value="WSIB-001" />
          <TapeChip
            label="Phase"
            value="Ideate → Ship"
            className="hidden sm:block"
          />
          <TapeChip
            label="Output"
            value="3 ideas · roadmap"
            className="hidden md:block"
          />
          <TapeStamp className="hidden lg:flex" />
          <TapeChip
            label="Includes"
            value="Stack · MVP · AGENTS.md"
            className="hidden xl:block"
          />
        </div>
      </div>
    </div>
  );
}
