"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Layers, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", Icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", Icon: ArrowLeftRight, label: "Transactions" },
  { href: "/blocks", Icon: Layers, label: "Blocks" },
  { href: "/insights", Icon: BarChart2, label: "Insights" },
  { href: "/settings", Icon: Settings, label: "Settings" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-[68px] shrink-0 flex flex-col items-center py-7 bg-surface border-r border-border">
      {/* Logo */}
      <div className="mb-9">
        <div className="w-[30px] h-[30px] rounded-[9px] bg-ink-deep flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#FAFAF8" strokeWidth="1.2" />
            <circle cx="7" cy="7" r="2" fill="#FAFAF8" />
          </svg>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-0.5 w-full px-2.5 flex-1">
        {NAV_ITEMS.map(({ href, Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "w-full aspect-square rounded-[11px] flex items-center justify-center transition-colors duration-150",
                isActive
                  ? "bg-ink text-surface"
                  : "bg-transparent text-ink-tertiary hover:text-ink hover:bg-ink-ghost/40"
              )}
            >
              <Icon size={17} strokeWidth={isActive ? 2 : 1.6} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
