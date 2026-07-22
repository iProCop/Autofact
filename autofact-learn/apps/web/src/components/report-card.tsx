"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { ReportListItem } from "@/lib/api";
import { DEMO_SPECS } from "@/lib/demo-data";
import { formatDate, formatKm, formatPrice, scoreToGrade } from "@/lib/ui";

const PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=400&q=80",
];

type Props = {
  report: ReportListItem;
  favorited?: boolean;
  onToggleFavorite?: () => void;
};

export function ReportCard({ report, favorited, onToggleFavorite }: Props) {
  const grade = scoreToGrade(report.expertOverallScore);
  const specs = DEMO_SPECS[report.id] ?? {
    engine: "Бензин",
    drive: "—",
    transmission: "Автомат",
  };
  const img =
    report.coverUrl &&
    (report.coverUrl.startsWith("http") || report.coverUrl.startsWith("/"))
      ? report.coverUrl.startsWith("http")
        ? report.coverUrl
        : report.coverUrl
      : PLACEHOLDERS[Math.abs(report.title.length) % PLACEHOLDERS.length];

  return (
    <article className="card relative p-3">
      <button
        type="button"
        aria-label="Избранное"
        onClick={(e) => {
          e.preventDefault();
          onToggleFavorite?.();
        }}
        className="absolute right-3 top-3 z-10"
      >
        <Star
          size={18}
          fill={favorited ? "var(--star)" : "none"}
          color={favorited ? "var(--star)" : "#9aa6b5"}
        />
      </button>

      <Link href={`/reports/${report.id}`} className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt=""
          className="h-[100px] w-[100px] shrink-0 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1 pr-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[15px] font-bold">
              {report.make} {report.model}, {report.year}
            </h3>
            <span className={`grade grade-${grade.tier}`}>{grade.label}</span>
          </div>

          <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-[var(--muted)]">
            <span>Пробег: {formatKm(report.mileage)}</span>
            <span>Привод: {specs.drive}</span>
            <span>Двигатель: {specs.engine}</span>
            <span>КПП: {specs.transmission}</span>
          </div>

          <div className="mt-2">
            <p className="text-[11px]">
              <span className="underline-lime text-[var(--muted)]">Эксперт</span>
            </p>
            <p className="text-[12px]">
              {report.expert.fullName}{" "}
              <span className="text-[var(--warn)]">★</span>{" "}
              <span className="lime">{report.expert.rating.toFixed(1)}</span>
            </p>
            <p className="text-[11px] text-[var(--muted)]">
              Дата осмотра: {formatDate(report.createdAt)}
            </p>
          </div>
        </div>
      </Link>

      <div className="mt-1 flex items-center justify-between gap-2">
        {report.status === "DISPUTED" && (
          <span className="text-[11px] text-[var(--warn)]">спорный</span>
        )}
        <div className="ml-auto">
          <Link href={`/reports/${report.id}`} className="price-pill">
            {formatPrice(report.priceKopecks)}
          </Link>
        </div>
      </div>
    </article>
  );
}
