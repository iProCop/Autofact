"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileSearch, Star, UserRound } from "lucide-react";

const items = [
  { href: "/", label: "Дом", icon: Home },
  { href: "/reports", label: "Отчеты", icon: FileSearch },
  { href: "/favorites", label: "Избранное", icon: Star },
  { href: "/profile", label: "Профиль", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();
  const hidden =
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/loading");

  if (hidden) return null;

  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`nav-item ${active ? "active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={18} strokeWidth={2.2} />
            {active && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
