import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { getUser } from "@/lib/auth/get-user";

export const metadata: Metadata = {
  title: "Dashboard — What Should I Build?",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
