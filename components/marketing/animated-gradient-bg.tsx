export function AnimatedGradientBg() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950" />

      {/* Distributed glow orbs — cover full viewport at every scroll position */}
      <div className="animate-gradient-drift absolute -left-[15%] -top-[15%] h-[70vh] w-[70vw] rounded-full bg-[var(--marketing-glow-a)] blur-[120px] opacity-85" />
      <div className="animate-gradient-drift-reverse absolute -bottom-[20%] -right-[10%] h-[60vh] w-[60vw] rounded-full bg-[var(--marketing-glow-b)] blur-[110px]" />
      <div className="animate-gradient-drift-slow absolute left-[35%] top-[40%] h-[50vh] w-[50vw] rounded-full bg-[var(--marketing-glow-c)] blur-[130px]" />

      <div
        className="animate-gradient-drift-alt absolute -right-[18%] top-[18%] h-[55vh] w-[55vw] rounded-full bg-[var(--marketing-glow-b)] blur-[100px] opacity-80"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="animate-gradient-drift absolute left-[5%] top-[62%] h-[48vh] w-[48vw] rounded-full bg-[var(--marketing-glow-a)] blur-[115px]"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="animate-gradient-drift-reverse absolute right-[8%] top-[78%] h-[52vh] w-[52vw] rounded-full bg-[var(--marketing-glow-c)] blur-[105px]"
        style={{ animationDelay: "-2s" }}
      />
      <div
        className="animate-gradient-drift-slow absolute -left-[8%] top-[88%] h-[44vh] w-[44vw] rounded-full bg-[var(--marketing-glow-b)] blur-[110px]"
        style={{ animationDelay: "-9s" }}
      />
      <div
        className="animate-gradient-drift-alt absolute left-[42%] top-[52%] h-[38vh] w-[38vw] rounded-full bg-[var(--marketing-glow-a)] blur-[95px]"
        style={{ animationDelay: "-11s" }}
      />

      <div className="absolute inset-0 bg-[length:24px_24px] bg-[radial-gradient(circle,_rgb(161_161_170_/_0.08)_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_rgb(113_113_122_/_0.16)_1px,_transparent_1px)]" />
      <div className="absolute inset-0 bg-zinc-50/20 dark:bg-zinc-950/30" />
    </div>
  );
}
