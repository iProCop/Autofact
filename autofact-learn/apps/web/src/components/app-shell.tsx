"use client";

import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noNav =
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/loading");

  return <div className={`app-shell ${noNav ? "no-nav" : ""}`}>{children}</div>;
}
