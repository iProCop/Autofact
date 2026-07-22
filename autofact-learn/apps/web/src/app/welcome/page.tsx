"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { getSession } from "@/lib/api";
import { useEffect } from "react";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    if (getSession()) router.replace("/");
  }, [router]);

  return (
    <div className="flex min-h-[100vh] flex-col">
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-16">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[62%] bg-[radial-gradient(circle_at_50%_30%,rgba(180,230,75,0.16),transparent_55%),linear-gradient(180deg,#07101f_0%,#0a1220_70%,transparent_100%)]"
          aria-hidden
        />
        <BrandLogo size={120} />
        <h1 className="display relative mt-4 text-3xl font-extrabold tracking-tight">
          Авто<span className="underline-lime lime">Факт</span>
        </h1>
      </section>

      <section className="relative rounded-t-[32px] bg-white px-6 pb-10 pt-8 text-center text-[#12161c]">
        <h2 className="display text-[28px] font-extrabold leading-tight">
          <span className="underline-lime decoration-[3px]">До</span>веряй,
          <br />
          Но Проверяй С{" "}
          <span className="underline-lime decoration-[3px]">На</span>ми
        </h2>
        <p className="mt-3 text-sm text-[#6b7380]">
          Зрение эксперта в вашем смартфоне
        </p>
        <div className="progress-track mt-8">
          <div className="progress-fill" style={{ width: "34%" }} />
        </div>
        <Link href="/login" className="btn btn-dark btn-block mt-8">
          Начать
        </Link>
      </section>
    </div>
  );
}
