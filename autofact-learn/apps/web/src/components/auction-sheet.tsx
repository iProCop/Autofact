"use client";

import { useState } from "react";
import { DEFECT_LABELS } from "@/lib/ui";

export type DefectMarker = {
  id: string;
  view: "side" | "top" | "rear" | "interior";
  x: number;
  y: number;
  type: string;
  severity: number;
  title: string;
  note?: string;
  photoUrl?: string;
};

type Props = {
  defects: DefectMarker[];
  locked?: boolean;
  onSelect?: (d: DefectMarker) => void;
};

const VIEWS: { key: DefectMarker["view"]; label: string }[] = [
  { key: "side", label: "Бок" },
  { key: "top", label: "Сверху" },
  { key: "rear", label: "Сзади" },
  { key: "interior", label: "Салон" },
];

function CarSvg({ view }: { view: DefectMarker["view"] }) {
  if (view === "top") {
    return (
      <g>
        <rect x="70" y="30" width="260" height="140" rx="48" fill="#1c2736" stroke="#3a4a60" strokeWidth="3" />
        <rect x="110" y="48" width="80" height="104" rx="14" fill="#121820" stroke="#2f3d50" />
        <rect x="210" y="48" width="80" height="104" rx="14" fill="#121820" stroke="#2f3d50" />
        <circle cx="95" cy="55" r="10" fill="#0d121a" />
        <circle cx="95" cy="145" r="10" fill="#0d121a" />
        <circle cx="305" cy="55" r="10" fill="#0d121a" />
        <circle cx="305" cy="145" r="10" fill="#0d121a" />
        <text x="200" y="108" textAnchor="middle" fill="#5b6b80" fontSize="13">Вид сверху</text>
      </g>
    );
  }
  if (view === "rear") {
    return (
      <g>
        <rect x="110" y="40" width="180" height="120" rx="28" fill="#1c2736" stroke="#3a4a60" strokeWidth="3" />
        <rect x="130" y="58" width="140" height="40" rx="8" fill="#10161f" stroke="#2f3d50" />
        <rect x="145" y="130" width="40" height="14" rx="4" fill="#b4e64b" opacity="0.7" />
        <rect x="215" y="130" width="40" height="14" rx="4" fill="#b4e64b" opacity="0.7" />
        <text x="200" y="110" textAnchor="middle" fill="#5b6b80" fontSize="13">Корма</text>
      </g>
    );
  }
  if (view === "interior") {
    return (
      <g>
        <rect x="90" y="35" width="220" height="140" rx="24" fill="#1c2736" stroke="#3a4a60" strokeWidth="3" />
        <rect x="110" y="55" width="70" height="50" rx="10" fill="#121820" stroke="#2f3d50" />
        <rect x="220" y="55" width="70" height="50" rx="10" fill="#121820" stroke="#2f3d50" />
        <rect x="110" y="120" width="70" height="40" rx="10" fill="#121820" stroke="#2f3d50" />
        <rect x="220" y="120" width="70" height="40" rx="10" fill="#121820" stroke="#2f3d50" />
        <text x="200" y="108" textAnchor="middle" fill="#5b6b80" fontSize="13">Салон</text>
      </g>
    );
  }
  // side
  return (
    <g>
      <path
        d="M55 125 C70 95, 95 78, 130 72 L175 55 L250 55 L295 72 C320 80, 340 95, 350 125 L350 138 C330 145, 310 148, 290 148 L110 148 C90 148, 70 145, 55 138 Z"
        fill="#1c2736"
        stroke="#3a4a60"
        strokeWidth="3"
      />
      <path d="M175 58 L245 58 L265 72 L160 72 Z" fill="#10161f" stroke="#2f3d50" />
      <circle cx="120" cy="140" r="22" fill="#0d121a" stroke="#4a5a70" strokeWidth="4" />
      <circle cx="300" cy="140" r="22" fill="#0d121a" stroke="#4a5a70" strokeWidth="4" />
      <text x="210" y="115" textAnchor="middle" fill="#5b6b80" fontSize="13">Вид сбоку</text>
    </g>
  );
}

export function AuctionSheet({ defects, locked, onSelect }: Props) {
  const [view, setView] = useState<DefectMarker["view"]>("side");
  const [activeId, setActiveId] = useState<string | null>(null);
  const visible = defects.filter((d) => d.view === view);

  return (
    <div className={`card overflow-hidden ${locked ? "relative" : ""}`}>
      <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
        <p className="display text-sm font-bold">Карта дефектов</p>
        <div className="flex gap-1">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                view === v.key
                  ? "bg-[var(--lime)] text-[var(--ink)]"
                  : "bg-[var(--elev)] text-[var(--muted)]"
              }`}
              onClick={() => setView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative px-2 py-3">
        <svg viewBox="0 0 400 200" className="h-auto w-full">
          <CarSvg view={view} />
          {visible.map((d, idx) => (
            <g
              key={d.id}
              className="cursor-pointer"
              onClick={() => {
                if (locked) return;
                setActiveId(d.id);
                onSelect?.(d);
              }}
            >
              <circle
                cx={(d.x / 100) * 400}
                cy={(d.y / 100) * 200}
                r={activeId === d.id ? 14 : 11}
                fill={d.severity >= 3 ? "#ff5c5c" : d.severity === 2 ? "#f0a020" : "#b4e64b"}
                stroke="#0a0e14"
                strokeWidth="2"
              />
              <text
                x={(d.x / 100) * 400}
                y={(d.y / 100) * 200 + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#0a0e14"
              >
                {idx + 1}
              </text>
            </g>
          ))}
        </svg>

        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(8,12,18,0.55)] backdrop-blur-[2px]">
            <p className="rounded-full bg-[var(--elev)] px-4 py-2 text-sm font-semibold">
              Полная карта — после покупки
            </p>
          </div>
        )}
      </div>

      {!locked && (
        <div className="space-y-2 border-t border-[var(--line)] px-3 py-3">
          {visible.length === 0 && (
            <p className="text-sm text-[var(--muted)]">На этом виде дефектов нет ✓</p>
          )}
          {visible.map((d, idx) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setActiveId(d.id);
                onSelect?.(d);
              }}
              className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition ${
                activeId === d.id
                  ? "border-[var(--lime)] bg-[var(--lime-dim)]"
                  : "border-[var(--line)] bg-[var(--elev)]"
              }`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--lime)] text-xs font-bold text-[var(--ink)]">
                {idx + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{d.title}</span>
                <span className="text-[11px] text-[var(--muted)]">
                  {DEFECT_LABELS[d.type] ?? d.type} · серьёзность {d.severity}/3
                </span>
                {d.note && <span className="mt-1 block text-xs text-[var(--muted)]">{d.note}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
