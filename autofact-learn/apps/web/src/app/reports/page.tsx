"use client";

import { FormEvent, useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { ReportCard } from "@/components/report-card";
import { api, getSession, type ReportListItem } from "@/lib/api";
import { DEMO_REPORTS } from "@/lib/demo-data";
import { isFavorite, toggleFavorite } from "@/lib/ui";

export default function ReportsPage() {
  const [items, setItems] = useState<ReportListItem[]>([]);
  const [all, setAll] = useState<ReportListItem[]>([]);
  const [make, setMake] = useState("");
  const [year, setYear] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);
  const name = getSession()?.user.email.split("@")[0] ?? "Гость";

  useEffect(() => {
    api<{ items: ReportListItem[]; total: number }>("/reports", { auth: false })
      .then((data) => {
        const list = data.items.length ? data.items : DEMO_REPORTS;
        setAll(list);
        setItems(list);
      })
      .catch(() => {
        setAll(DEMO_REPORTS);
        setItems(DEMO_REPORTS);
      })
      .finally(() => setLoading(false));
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const filtered = all.filter((r) => {
      const q = make.trim().toLowerCase();
      const okMake =
        !q ||
        r.make.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) ||
        `${r.make} ${r.model}`.toLowerCase().includes(q);
      const okYear = !year || String(r.year) === year;
      const okCity =
        !city ||
        r.city.toLowerCase().includes(city.toLowerCase()) ||
        r.region.toLowerCase().includes(city.toLowerCase());
      return okMake && okYear && okCity;
    });
    setItems(filtered);
  }

  return (
    <div className="page space-y-4">
      <header className="pt-1">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--lime)] text-[var(--lime)]">
            <UserRound size={16} />
          </span>
          <h1 className="display text-xl font-extrabold">{name}</h1>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Доступно{" "}
          <span className="lime font-semibold">
            {Math.max(all.length * 150, 1253)}
          </span>{" "}
          отчета
        </p>
      </header>

      <form className="space-y-2" onSubmit={onSearch}>
        <input
          className="field !pr-4"
          placeholder="Марка, модель"
          value={make}
          onChange={(e) => setMake(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="field !pr-4"
            placeholder="Год"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <input
            className="field !pr-4"
            placeholder="Город"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <button className="btn btn-lime btn-block" type="submit">
          Найти
        </button>
      </form>

      <div className="space-y-3">
        {loading && (
          <>
            <div className="skeleton h-28" />
            <div className="skeleton h-28" />
          </>
        )}
        {!loading &&
          items.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              favorited={isFavorite("reports", report.id)}
              onToggleFavorite={() => {
                toggleFavorite("reports", report.id);
                setTick((x) => x + 1);
              }}
            />
          ))}
        {!loading && items.length === 0 && (
          <p className="text-sm text-[var(--muted)]">Ничего не найдено</p>
        )}
      </div>
    </div>
  );
}
