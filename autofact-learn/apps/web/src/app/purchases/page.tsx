"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getSession } from "@/lib/api";
import { formatPrice } from "@/lib/ui";

type Purchase = {
  id: string;
  priceKopecks: number;
  createdAt: string;
  report: { id: string; title: string; make: string; model: string; year: number };
};

export default function PurchasesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Purchase[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session || session.user.role !== "CLIENT") {
      router.push("/login");
      return;
    }
    api<Purchase[]>("/purchases/history")
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка"));
  }, [router]);

  return (
    <div className="page space-y-4">
      <h1 className="display text-xl font-extrabold underline-lime">Мои покупки</h1>
      {error && <p className="text-[var(--danger)]">{error}</p>}
      {items.length === 0 && !error && (
        <p className="text-sm text-[var(--muted)]">Пока нет покупок.</p>
      )}
      {items.map((p) => (
        <Link key={p.id} href={`/reports/${p.report.id}`} className="card block p-4">
          <p className="font-semibold">{p.report.title}</p>
          <p className="text-sm text-[var(--muted)]">
            {p.report.make} {p.report.model} · {p.report.year}
          </p>
          <div className="mt-2 flex justify-end">
            <span className="price-pill">{formatPrice(p.priceKopecks)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
