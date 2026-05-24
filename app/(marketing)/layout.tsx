import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { AnimatedGradientBg } from "@/components/marketing/animated-gradient-bg";
import { ScrollProgress } from "@/components/marketing/scroll-progress";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ScrollProgress />
      <AnimatedGradientBg />
      <SiteHeader />
      <div className="relative flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
