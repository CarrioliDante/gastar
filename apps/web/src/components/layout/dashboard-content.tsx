"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/motion/page-transition";
import { useUIStore } from "@/stores/ui";

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const animationsEnabled = useUIStore((s) => s.animationsEnabled);

  useEffect(() => {
    document.body.classList.toggle("no-animations", !animationsEnabled);
  }, [animationsEnabled]);

  if (!animationsEnabled) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {children}
      </div>
    );
  }

  return (
    <PageTransition id={pathname}>
      {children}
    </PageTransition>
  );
}
