"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/motion/page-transition";

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <PageTransition id={pathname}>
      {children}
    </PageTransition>
  );
}
