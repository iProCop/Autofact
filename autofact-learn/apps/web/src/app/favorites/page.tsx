"use client";

import { useEffect, useState } from "react";
import { ReportCard } from "@/components/report-card";
import { ExpertCard } from "@/components/expert-card";
import { api, type ReportListItem } from "@/lib/api";
import { DEMO_EXPERTS, DEMO_REPORTS, type DemoExpert } from "@/lib/demo-data";
import { getFavorites, isFavorite, toggleFavorite } from "@/lib/ui";

export default function FavoritesPage() {
  const [tab, setTab] = useState<"cars" | "experts">("cars");
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [experts, setExperts] = useState<DemoExpert[]>([]);
  const [allExperts, setAllExperts] = useState<DemoExpert[]>(DEMO_EXPERTS);
  const [, setTick] = useState(0);

  function refresh() {
    const fav = getFavorites();
    api<{ items: ReportListItem[] }>("/reports", { auth: false })
      .then((data) => {
        const pool = data.items.length ? data.items : DEMO_REPORTS;
        setReports(pool.filter((r) => fav.reports.includes(r.id)));
      })
      .catch(() => {
        setReports(DEMO_REPORTS.filter((r) => fav.reports.includes(r.id)));
      });

    api<DemoExpert[]>("/users/experts", { auth: false })
      .then((data) => {
        const pool =
          data.length > 0
            ? data.map((e, i) => ({
                ...DEMO_EXPERTS[i % DEMO_EXPERTS.length],
                ...e,
                avatarUrl:
                  DEMO_EXPERTS[i % DEMO_EXPERTS.length]?.avatarUrl ??
                  DEMO_EXPERTS[0].avatarUrl,
                priceLabel:
                  DEMO_EXPERTS[i % DEMO_EXPERTS.length]?.priceLabel ?? "3000₽",
              }))
            : DEMO_EXPERTS;
        setAllExperts(pool);
        setExperts(pool.filter((e) => fav.experts.includes(e.id)));
      })
      .catch(() => {
        setAllExperts(DEMO_EXPERTS);
        setExperts(DEMO_EXPERTS.filter((e) => fav.experts.includes(e.id)));
      });
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="page space-y-4">
      <h1 className="display pt-1 text-center text-xl font-extrabold underline-lime">
        Избранное
      </h1>

      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--elev)]">
        <button
          type="button"
          className={`py-3 text-sm font-semibold ${tab === "cars" ? "bg-[var(--card-2)] text-white" : "text-[var(--muted)]"}`}
          onClick={() => setTab("cars")}
        >
          Автомобили
        </button>
        <button
          type="button"
          className={`py-3 text-sm font-semibold ${tab === "experts" ? "bg-[var(--card-2)] text-white" : "text-[var(--muted)]"}`}
          onClick={() => setTab("experts")}
        >
          Эксперты
        </button>
      </div>

      <div className="space-y-3">
        {tab === "cars" &&
          reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              favorited
              onToggleFavorite={() => {
                toggleFavorite("reports", report.id);
                setReports((prev) => prev.filter((r) => r.id !== report.id));
                setTick((x) => x + 1);
              }}
            />
          ))}
        {tab === "cars" && reports.length === 0 && (
          <p className="text-sm text-[var(--muted)]">
            Пока пусто — нажми ★ на карточке авто в каталоге.
          </p>
        )}

        {tab === "experts" && experts.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--muted)]">
              В избранном пусто — добавь эксперта ★
            </p>
            {allExperts.map((expert) => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                favorited={isFavorite("experts", expert.id)}
                onToggleFavorite={() => {
                  toggleFavorite("experts", expert.id);
                  refresh();
                  setTick((x) => x + 1);
                }}
              />
            ))}
          </div>
        )}

        {tab === "experts" &&
          experts.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              favorited
              onToggleFavorite={() => {
                toggleFavorite("experts", expert.id);
                setExperts((prev) => prev.filter((e) => e.id !== expert.id));
                setTick((x) => x + 1);
              }}
            />
          ))}
      </div>
    </div>
  );
}
