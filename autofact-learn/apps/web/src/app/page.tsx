"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { ReportCard } from "@/components/report-card";
import { api, getSession, type ReportListItem } from "@/lib/api";
import { DEMO_REPORTS } from "@/lib/demo-data";
import { isFavorite, toggleFavorite } from "@/lib/ui";

export default function HomePage() {
  const [items, setItems] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [, setFavTick] = useState(0);
  const session = useMemo(() => getSession(), []);
  const name = session?.user.email.split("@")[0] ?? "Гость";

  useEffect(() => {
    api<{ items: ReportListItem[]; total: number }>("/reports", { auth: false })
      .then((data) => {
        if (data.items.length === 0) {
          setItems(DEMO_REPORTS);
          setDemo(true);
        } else {
          setItems(data.items);
        }
      })
      .catch(() => {
        setItems(DEMO_REPORTS);
        setDemo(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page space-y-5">
      <header className="flex items-start justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--lime)] text-[var(--lime)]">
              <UserRound size={16} />
            </span>
            <h1 className="display text-[22px] font-extrabold leading-none">
              {name},
            </h1>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">Добро пожаловать!</p>
          {demo && (
            <p className="mt-1 text-[11px] text-[var(--lime)]">
              Демо-данные · API можно подключить позже
            </p>
          )}
        </div>
        <span className="mt-1 h-3 w-3 rounded-full bg-[var(--lime)] shadow-[0_0_12px_var(--lime-glow)]" />
      </header>

      <section>
        <h2 className="display mb-3 text-lg font-bold underline-lime">
          Рекомендации экспертов
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <article className="hero-card min-w-[86%] p-4 sm:min-w-[360px]">
            <h3 className="display max-w-[14ch] text-[22px] font-extrabold leading-tight">
              Высокие баллы по отчетам
            </h3>
            <div className="mt-auto flex items-end justify-between gap-2 pt-10">
              <div className="flex flex-wrap gap-2">
                <span className="chip">☆ Оценки от 4B</span>
                <span className="chip">💧 Минимальные риски</span>
              </div>
              <Link href="/reports" className="btn btn-lime !px-4 !py-2 text-sm">
                Смотреть
              </Link>
            </div>
          </article>
          <article className="card flex min-w-[220px] flex-col justify-between p-4">
            <div>
              <p className="display text-lg font-bold">Свежие осмотры</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Доступно{" "}
                <span className="lime font-semibold">
                  {Math.max(items.length * 150, 1253)}
                </span>{" "}
                отчетов
              </p>
            </div>
            <Link href="/reports" className="btn btn-lime mt-6 !py-2 text-sm">
              В каталог
            </Link>
          </article>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="display text-lg font-bold">Только для Вас</h2>
        {loading && (
          <div className="space-y-3">
            <div className="skeleton h-28" />
            <div className="skeleton h-28" />
          </div>
        )}
        {!loading &&
          items.slice(0, 6).map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              favorited={isFavorite("reports", report.id)}
              onToggleFavorite={() => {
                toggleFavorite("reports", report.id);
                setFavTick((x) => x + 1);
              }}
            />
          ))}
      </section>
    </div>
  );
}
