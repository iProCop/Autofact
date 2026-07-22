"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { api, setSession, type AuthSession } from "@/lib/api";

const DEMO_USERS: Record<
  string,
  { password: string; session: AuthSession }
> = {
  "client@autoinspect.local": {
    password: "password123",
    session: {
      accessToken: "demo-client-token",
      refreshToken: "demo-client-refresh",
      user: {
        id: "demo-client",
        email: "client@autoinspect.local",
        role: "CLIENT",
      },
    },
  },
  "expert@autoinspect.local": {
    password: "password123",
    session: {
      accessToken: "demo-expert-token",
      refreshToken: "demo-expert-refresh",
      user: {
        id: "demo-expert",
        email: "expert@autoinspect.local",
        role: "EXPERT",
      },
    },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("client@autoinspect.local");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let session: AuthSession | null = null;

      try {
        session = await api<AuthSession>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
          auth: false,
        });
      } catch (apiErr) {
        const demo = DEMO_USERS[email.toLowerCase()];
        if (demo && demo.password === password) {
          session = demo.session;
          sessionStorage.setItem("autofact_demo", "1");
        } else {
          throw apiErr;
        }
      }

      setSession(session);
      router.push("/loading");
      const target = session.user.role === "EXPERT" ? "/expert" : "/";
      setTimeout(() => router.replace(target), 800);
    } catch (err) {
      const msg =
        err instanceof Error && err.message.includes("fetch")
          ? "API недоступен. Для демо: client@autoinspect.local / password123"
          : err instanceof Error
            ? err.message
            : "Ошибка входа";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100vh] px-5 pb-10 pt-8">
      <div className="flex flex-col items-center">
        <BrandLogo size={96} />
        <h1 className="display mt-3 text-2xl font-extrabold">
          Авториза<span className="lime">ция</span>
        </h1>
      </div>

      <form className="mt-8 space-y-3" onSubmit={onSubmit}>
        <div className="field-wrap">
          <input
            className="field"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <UserRound className="field-icon" size={18} />
        </div>
        <div className="field-wrap">
          <input
            className="field"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <LockKeyhole className="field-icon" size={18} />
        </div>

        <div className="flex items-center justify-between px-1 text-xs text-[var(--muted)]">
          <span>Запомнить?</span>
          <button type="button" className="hover:text-[var(--text)]">
            Забыли пароль?
          </button>
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <p className="pt-2 text-center text-sm">
          <Link href="/register" className="lime font-semibold">
            Зарегистрироваться
          </Link>
        </p>

        <div className="progress-track mt-6">
          <div className="progress-fill" style={{ width: "58%" }} />
        </div>

        <button className="btn btn-dark btn-block mt-4" disabled={loading} type="submit">
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>

      <div className="mt-6 space-y-1 text-center text-xs text-[var(--muted)]">
        <p>Клиент: client@autoinspect.local</p>
        <p>Эксперт: expert@autoinspect.local</p>
        <p>Пароль: password123</p>
      </div>
    </div>
  );
}
