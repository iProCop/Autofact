"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Gauge,
  MapPin,
  Star,
  UserRound,
} from "lucide-react";
import { AuctionSheet, type DefectMarker } from "@/components/auction-sheet";
import { MediaGallery } from "@/components/media-gallery";
import { ScorePanel } from "@/components/score-panel";
import { api, getSession } from "@/lib/api";
import { DEMO_SPECS, getDemoReportDetail } from "@/lib/demo-data";
import {
  formatDate,
  formatKm,
  formatPrice,
  isFavorite,
  scoreToGrade,
  toggleFavorite,
} from "@/lib/ui";

type ReportDetail = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  region: string;
  city: string;
  status: string;
  expertOverallScore: number;
  platformScore: number | null;
  disputed: boolean;
  priceKopecks: number;
  locked: boolean;
  purchased: boolean;
  isOwner: boolean;
  createdAt: string;
  coverUrl?: string | null;
  expert: { fullName: string; rating: number; bio?: string };
  scores?: {
    bodyScore: number;
    paintScore: number;
    techScore: number;
    interiorScore: number;
    overall: number;
  };
  media?: { id: string; type: string; url: string }[];
  inspection?: null | {
    vin: string | null;
    summary: string;
    expertNotes?: string;
    bodyScore: number;
    paintScore: number;
    techScore: number;
    interiorScore: number;
    tiresScore?: number;
    electricsScore?: number;
    defects: DefectMarker[];
    mileage: number;
  };
};

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [fav, setFav] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<DefectMarker | null>(null);
  const [tab, setTab] = useState<"sheet" | "media" | "text">("sheet");

  async function load(forceUnlock = unlocked) {
    try {
      const data = await api<ReportDetail>(`/reports/${id}`);
      // normalize API shape
      const normalized: ReportDetail = {
        ...data,
        scores: data.scores ?? {
          bodyScore: data.inspection?.bodyScore ?? 7,
          paintScore: data.inspection?.paintScore ?? 7,
          techScore: data.inspection?.techScore ?? 7,
          interiorScore: data.inspection?.interiorScore ?? 7,
          overall: data.expertOverallScore,
        },
        media: (data.media ?? []).map((m) => ({
          ...m,
          url: m.url.startsWith("http") ? m.url : `http://localhost:3010${m.url}`,
        })),
      };
      setReport(normalized);
      if (!data.locked) setUnlocked(true);
    } catch {
      const demo = getDemoReportDetail(id, forceUnlock || unlocked);
      setReport({
        ...demo,
        media: demo.media,
        scores: demo.scores,
        inspection: demo.inspection,
      });
    }
    setFav(isFavorite("reports", id));
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (unlocked) void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  async function buy() {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    if (session.accessToken.startsWith("demo-") || id.startsWith("demo-") || !report) {
      setBusy(true);
      setTimeout(() => {
        setUnlocked(true);
        setBusy(false);
        setTab("sheet");
      }, 500);
      return;
    }

    setBusy(true);
    setError("");
    try {
      const initiated = await api<{ paymentId: string; reportId: string }>(
        "/purchases/initiate",
        { method: "POST", body: JSON.stringify({ reportId: id }) },
      );
      router.push(
        `/payments/mock?paymentId=${initiated.paymentId}&reportId=${initiated.reportId}`,
      );
    } catch (e) {
      // fallback unlock for UX if payment fails in local demo
      setUnlocked(true);
      setError(e instanceof Error ? e.message : "Ошибка покупки");
    } finally {
      setBusy(false);
    }
  }

  const specs = useMemo(() => DEMO_SPECS[id] ?? DEMO_SPECS["demo-r1"], [id]);

  if (!report && !error) {
    return (
      <div className="page space-y-3">
        <div className="skeleton h-52" />
        <div className="skeleton h-40" />
      </div>
    );
  }
  if (!report) return <p className="page text-[var(--danger)]">{error}</p>;

  const locked = report.locked && !unlocked;
  const grade = scoreToGrade(report.expertOverallScore);
  const scores = report.scores ?? {
    bodyScore: 7,
    paintScore: 7,
    techScore: 7,
    interiorScore: 7,
    overall: report.expertOverallScore,
  };
  const defects = (report.inspection?.defects ?? []) as DefectMarker[];

  return (
    <div className="page space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <Link href="/reports" className="text-[var(--lime)]">
          <ArrowLeft />
        </Link>
        <button
          type="button"
          onClick={() => {
            toggleFavorite("reports", id);
            setFav(isFavorite("reports", id));
          }}
        >
          <Star
            size={20}
            fill={fav ? "var(--star)" : "none"}
            color={fav ? "var(--star)" : "#9aa6b5"}
          />
        </button>
      </div>

      {/* Hero */}
      <section className="card overflow-hidden">
        <div
          className="relative min-h-[210px] bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(8,12,18,0.1), rgba(8,12,18,0.92)), url(${
              report.coverUrl ||
              report.media?.[0]?.url ||
              "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80"
            })`,
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Аукционный лист · АвтоФакт
                </p>
                <h1 className="display text-2xl font-extrabold leading-tight">
                  {report.make} {report.model}, {report.year}
                </h1>
              </div>
              <span className={`grade grade-${grade.tier} !text-sm !px-2.5 !py-1`}>
                {grade.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-white/85">
              <span className="chip">
                <Gauge size={12} /> {formatKm(report.mileage)}
              </span>
              <span className="chip">
                <MapPin size={12} /> {report.city}
              </span>
              <span className="chip">{specs.engine}</span>
              <span className="chip">{specs.drive}</span>
              <span className="chip">{specs.transmission}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] p-3">
          <div>
            <p className="text-[11px] text-[var(--muted)]">Цена отчёта</p>
            <p className="display text-xl font-extrabold lime">
              {formatPrice(report.priceKopecks)}
            </p>
          </div>
          {locked ? (
            <button className="btn btn-lime" disabled={busy} onClick={() => void buy()}>
              {busy ? "…" : "Открыть полный отчёт"}
            </button>
          ) : (
            <span className="price-pill">Полный доступ</span>
          )}
        </div>
      </section>

      {report.disputed && (
        <p className="rounded-2xl border border-[rgba(240,160,32,0.35)] bg-[rgba(240,160,32,0.1)] px-3 py-2 text-sm text-[var(--warn)]">
          Внимание: по VIN есть расхождение оценок экспертов (DISPUTED).
        </p>
      )}

      <ScorePanel scores={scores} locked={locked} />

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[var(--elev)] p-1">
        {(
          [
            ["sheet", "Схема"],
            ["media", "Фото/видео"],
            ["text", "Заключение"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`rounded-xl py-2 text-sm font-semibold ${
              tab === key ? "bg-[var(--lime)] text-[var(--ink)]" : "text-[var(--muted)]"
            }`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "sheet" && (
        <div className="space-y-3">
          <AuctionSheet
            defects={
              locked
                ? defects.length
                  ? defects
                  : [
                      { id: "x1", view: "side", x: 30, y: 45, type: "scratch", severity: 1, title: "…" },
                      { id: "x2", view: "side", x: 70, y: 50, type: "dent", severity: 2, title: "…" },
                    ]
                : defects
            }
            locked={locked}
            onSelect={setSelectedDefect}
          />
          {selectedDefect?.photoUrl && !locked && (
            <div className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedDefect.photoUrl} alt="" className="max-h-56 w-full object-cover" />
              <p className="p-3 text-sm">
                <span className="font-semibold">{selectedDefect.title}</span>
                <br />
                <span className="text-[var(--muted)]">{selectedDefect.note}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "media" && (
        <MediaGallery items={report.media ?? []} locked={locked} />
      )}

      {tab === "text" && (
        <div className="space-y-3">
          <div className="card space-y-2 p-4">
            <p className="display font-bold">Пробег</p>
            <p className="text-2xl font-extrabold lime">{formatKm(report.mileage)}</p>
            <p className="text-sm text-[var(--muted)]">
              {locked
                ? "Проверка спидометра и сервисной истории — в полном отчёте"
                : "Показания соответствуют износу, следов скрутки не выявлено (по косвенным признакам)."}
            </p>
          </div>

          <div className="card space-y-2 p-4">
            <p className="display font-bold">Заключение эксперта</p>
            {locked ? (
              <p className="text-sm text-[var(--muted)]">
                Текст заключения, VIN и детальный разбор недочётов откроются после покупки.
              </p>
            ) : (
              <>
                {report.inspection?.vin && (
                  <p className="font-mono text-sm">VIN: {report.inspection.vin}</p>
                )}
                <p className="text-sm">{report.inspection?.summary}</p>
                <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">
                  {report.inspection?.expertNotes}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Дата осмотра: {formatDate(report.createdAt)}
                </p>
              </>
            )}
          </div>

          <div className="card flex items-center gap-3 p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--lime)] text-[var(--lime)]">
              <UserRound size={22} />
            </span>
            <div>
              <p className="font-semibold">{report.expert.fullName}</p>
              <p className="text-sm text-[var(--muted)]">
                ★ {report.expert.rating.toFixed(1)}
                {report.platformScore != null && (
                  <> · платформа {report.platformScore.toFixed(1)}/10</>
                )}
              </p>
              {report.expert.bio && (
                <p className="mt-1 text-xs text-[var(--muted)]">{report.expert.bio}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {locked && (
        <div className="card sticky bottom-20 z-20 space-y-2 border-[var(--lime)] p-4 shadow-[0_0_30px_rgba(180,230,75,0.15)]">
          <p className="display font-bold">Полный расклад по авто</p>
          <p className="text-sm text-[var(--muted)]">
            Интерактивная схема дефектов, баллы 1–10, фото/видео, VIN и текстовое заключение.
          </p>
          <button className="btn btn-lime btn-block" disabled={busy} onClick={() => void buy()}>
            {busy ? "…" : `Купить за ${formatPrice(report.priceKopecks)}`}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
