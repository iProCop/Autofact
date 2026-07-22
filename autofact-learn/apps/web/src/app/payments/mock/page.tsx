"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/ui";

function MockPaymentInner() {
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get("paymentId") ?? "";
  const reportId = params.get("reportId") ?? "";
  const amount = params.get("amount");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await api("/purchases/mock/confirm", {
        method: "POST",
        body: JSON.stringify({ paymentId, reportId }),
        auth: false,
      });
      router.push(`/reports/${reportId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page mx-auto max-w-md space-y-4">
      <h1 className="display text-2xl font-extrabold">
        Оплата <span className="lime">AutoFact</span>
      </h1>
      <div className="card space-y-2 p-4 text-sm">
        <p className="text-[var(--muted)]">Mock YooKassa для MVP</p>
        <p className="font-mono text-xs break-all">{paymentId}</p>
        {amount && <p>Сумма: {formatPrice(Number(amount))}</p>}
      </div>
      {error && <p className="text-[var(--danger)]">{error}</p>}
      <button
        className="btn btn-lime btn-block"
        disabled={busy || !paymentId || !reportId}
        onClick={() => void confirm()}
      >
        {busy ? "…" : "Оплатить успешно"}
      </button>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={<div className="page skeleton h-40" />}>
      <MockPaymentInner />
    </Suspense>
  );
}
