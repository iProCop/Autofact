"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { api, getSession, setSession } from "@/lib/api";

type Me = {
  id: string;
  email: string;
  role: string;
  expert?: { fullName: string; rating: number; balanceKopecks: number } | null;
  client?: { id: string } | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/welcome");
      return;
    }

    if (session.accessToken.startsWith("demo-")) {
      setMe({
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        expert:
          session.user.role === "EXPERT"
            ? { fullName: "Владимир АвтоМастер", rating: 4.8, balanceKopecks: 125000 }
            : null,
        client: session.user.role === "CLIENT" ? { id: "demo-client" } : null,
      });
      return;
    }

    api<Me>("/users/me")
      .then(setMe)
      .catch(() => {
        setMe({
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        });
      });
  }, [router]);

  function logout() {
    setSession(null);
    sessionStorage.removeItem("autofact_demo");
    router.replace("/welcome");
  }

  if (!me) {
    return (
      <div className="page">
        <div className="skeleton h-40" />
      </div>
    );
  }

  return (
    <div className="page space-y-4">
      <h1 className="display pt-1 text-center text-xl font-extrabold underline-lime">
        Профиль
      </h1>

      <div className="card flex items-center gap-3 p-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--lime)] text-[var(--lime)]">
          <UserRound size={28} />
        </span>
        <div>
          <p className="display text-lg font-bold">
            {me.expert?.fullName ?? me.email.split("@")[0]}
          </p>
          <p className="text-sm text-[var(--muted)]">{me.email}</p>
          <p className="mt-1 text-xs">
            Роль: <span className="lime">{me.role}</span>
          </p>
        </div>
      </div>

      {me.role === "EXPERT" && (
        <Link href="/expert" className="btn btn-lime btn-block">
          Кабинет эксперта
        </Link>
      )}
      {me.role === "CLIENT" && (
        <Link href="/purchases" className="btn btn-dark btn-block">
          Мои покупки
        </Link>
      )}

      <button type="button" className="btn btn-dark btn-block" onClick={logout}>
        <LogOut size={16} /> Выйти
      </button>
    </div>
  );
}
