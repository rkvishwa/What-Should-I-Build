export function HeroAmbientBg() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="animate-hero-glow-drift absolute -left-[10%] top-[5%] h-[55%] w-[55%] rounded-full bg-[rgb(194_65_12/0.07)] blur-[90px] dark:bg-[rgb(154_52_18/0.06)]" />
      <div
        className="animate-hero-glow-drift-alt absolute -right-[8%] top-[10%] h-[50%] w-[50%] rounded-full bg-[rgb(154_52_18/0.05)] blur-[85px] dark:bg-[rgb(124_45_18/0.04)]"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="animate-hero-glow-drift absolute left-[35%] top-[25%] h-[45%] w-[45%] rounded-full bg-[rgb(124_45_18/0.04)] blur-[100px] dark:bg-[rgb(67_20_7/0.03)]"
        style={{ animationDelay: "-6s" }}
      />
    </div>
  );
}
