"use client";

import { BrandLogo } from "@/components/brand-logo";

export default function LoadingPage() {
  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-between px-6 pb-12 pt-16">
      <div className="flex flex-col items-center">
        <BrandLogo size={110} />
        <p className="display mt-4 text-xl font-bold">
          Выполняется <span className="lime">вход</span>
        </p>
      </div>

      <div className="relative flex h-40 w-40 items-center justify-center">
        <div
          className="absolute h-36 w-36 rounded-full border border-[rgba(180,230,75,0.2)]"
          style={{ animation: "pulse-glow 1.6s ease-in-out infinite" }}
        />
        <div className="spin-ring absolute h-28 w-28 rounded-full border-2 border-transparent border-t-[var(--lime)] border-r-[var(--lime)]" />
        <div className="h-20 w-20 rounded-full border border-[var(--lime)]" />
      </div>

      <div className="text-center">
        <p className="display text-lg font-bold">
          Ожида<span className="lime">йте</span>
        </p>
        <div className="progress-track mt-6">
          <div className="progress-fill" style={{ width: "40%" }} />
        </div>
      </div>
    </div>
  );
}
