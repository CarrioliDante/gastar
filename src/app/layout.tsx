import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Sidebar } from "@/components/navigation/sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gastar — Zen Finance",
  description: "A minimalist financial dashboard for calm money management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full overflow-hidden bg-bg text-ink antialiased" style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <QueryProvider>
          <div className="flex h-full w-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
