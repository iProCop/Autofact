"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, Mail, Smartphone, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { api, setSession, type AuthSession } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    password2: "",
    role: "CLIENT" as "CLIENT" | "EXPERT",
  });
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.password2) {
      setError("Пароли не совпадают");
      return;
    }
    try {
      router.push("/loading");
      const session = await api<AuthSession>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role,
          fullName: form.fullName || undefined,
          region: "Москва",
          city: "Москва",
        }),
        auth: false,
      });
      setSession(session);
      setTimeout(() => router.replace("/"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
      router.replace("/register");
    }
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-[100vh] px-5 pb-10 pt-6">
      <Link href="/login" className="inline-flex text-[var(--lime)]">
        <ArrowLeft />
      </Link>

      <div className="mt-2 flex flex-col items-center">
        <BrandLogo size={88} />
        <h1 className="display mt-2 text-2xl font-extrabold">
          Реги<span className="lime">страция</span>
        </h1>
      </div>

      <form className="mt-6 space-y-3" onSubmit={onSubmit}>
        <div className="field-wrap">
          <input
            className="field"
            placeholder="Имя пользователя"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />
          <UserRound className="field-icon" size={18} />
        </div>
        <div className="field-wrap">
          <input
            className="field"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <Mail className="field-icon" size={18} />
        </div>
        <div className="field-wrap">
          <input
            className="field"
            placeholder="Номер телефона"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Smartphone className="field-icon" size={18} />
        </div>
        <div className="field-wrap">
          <input
            className="field"
            placeholder="Введите пароль"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
          />
          <LockKeyhole className="field-icon" size={18} />
        </div>
        <div className="field-wrap">
          <input
            className="field"
            placeholder="Повторите пароль"
            type="password"
            required
            value={form.password2}
            onChange={(e) => set("password2", e.target.value)}
          />
          <LockKeyhole className="field-icon" size={18} />
        </div>

        <select
          className="field !pr-14"
          value={form.role}
          onChange={(e) => set("role", e.target.value as "CLIENT" | "EXPERT")}
        >
          <option value="CLIENT">Я клиент</option>
          <option value="EXPERT">Я эксперт</option>
        </select>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <div className="progress-track mt-4">
          <div className="progress-fill" style={{ width: "72%" }} />
        </div>

        <button className="btn btn-dark btn-block mt-4" type="submit">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}
