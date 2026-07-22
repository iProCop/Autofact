"use client";

import { scoreColor } from "@/lib/ui";

type Scores = {
  bodyScore: number;
  paintScore: number;
  techScore: number;
  interiorScore: number;
  tiresScore?: number;
  electricsScore?: number;
  overall: number;
};

export function ScorePanel({ scores, locked }: { scores: Scores; locked?: boolean }) {
  const rows = [
    { key: "Кузов", value: scores.bodyScore },
    { key: "ЛКП", value: scores.paintScore },
    { key: "Техника", value: scores.techScore },
    { key: "Салон", value: scores.interiorScore },
    ...(scores.tiresScore != null ? [{ key: "Шины", value: scores.tiresScore }] : []),
    ...(scores.electricsScore != null
      ? [{ key: "Электрика", value: scores.electricsScore }]
      : []),
  ];

  return (
    <div className={`card p-4 ${locked ? "opacity-80" : ""}`}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--muted)]">Общая оценка /10</p>
          <p
            className="display text-4xl font-extrabold"
            style={{ color: scoreColor(scores.overall) }}
          >
            {scores.overall.toFixed(1)}
          </p>
        </div>
        <p className="max-w-[18ch] text-right text-[11px] text-[var(--muted)]">
          Шкала как на японском аукционном листе: чем выше — тем лучше
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.key}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[var(--muted)]">{row.key}</span>
              <span className="font-bold" style={{ color: scoreColor(row.value) }}>
                {row.value}/10
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#0d121a]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${locked ? Math.min(row.value * 4, 28) : row.value * 10}%`,
                  background: scoreColor(row.value),
                  boxShadow: `0 0 12px ${scoreColor(row.value)}55`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {locked && (
        <p className="mt-3 text-center text-xs text-[var(--muted)]">
          Точные баллы откроются после покупки
        </p>
      )}
    </div>
  );
}
