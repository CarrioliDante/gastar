import { Sidebar } from "@/components/navigation/sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { KeyboardShortcuts } from "@/components/dashboard/keyboard-shortcuts";
import { QuickExpenseGlobal } from "@/components/dashboard/quick-expense-global";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--ink)" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
      <CommandPalette />
      <QuickExpenseGlobal />
      <KeyboardShortcuts />
    </div>
  );
}
