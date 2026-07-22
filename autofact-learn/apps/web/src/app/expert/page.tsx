"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getSession } from "@/lib/api";
import { formatPrice } from "@/lib/ui";

type MyReport = {
  id: string;
  title: string;
  status: string;
  make: string;
  model: string;
  year: number;
  basePriceKopecks: number;
};

type DefectForm = {
  view: "side" | "top" | "rear" | "interior";
  x: string;
  y: string;
  type: string;
  severity: string;
  title: string;
  note: string;
};

const emptyForm = {
  title: "",
  make: "",
  model: "",
  year: "2019",
  mileage: "80000",
  vin: "",
  engineScore: "8",
  bodyScore: "8",
  paintScore: "7",
  interiorScore: "8",
  tiresScore: "7",
  electricsScore: "8",
  basePriceKopecks: "150000",
  region: "Москва",
  city: "Москва",
  summary: "",
  expertNotes: "",
};

export default function ExpertPage() {
  const router = useRouter();
  const [reports, setReports] = useState<MyReport[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [defects, setDefects] = useState<DefectForm[]>([
    {
      view: "side",
      x: "30",
      y: "45",
      type: "scratch",
      severity: "1",
      title: "Царапина двери",
      note: "Поверхностная",
    },
  ]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [demoOnly, setDemoOnly] = useState(false);

  async function load() {
    const session = getSession();
    if (!session || session.user.role !== "EXPERT") {
      router.push("/login");
      return;
    }
    if (session.accessToken.startsWith("demo-")) {
      setDemoOnly(true);
      setReports([]);
      return;
    }
    setReports(await api<MyReport[]>("/reports/mine"));
  }

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : "Ошибка"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setField(key: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function createReport(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");

    if (demoOnly) {
      setOk("В демо-режиме API не пишет в БД. Войди через живой API как expert@…");
      return;
    }

    try {
      const payload = {
        title: form.title,
        make: form.make,
        model: form.model,
        year: Number(form.year),
        mileage: Number(form.mileage),
        vin: form.vin || undefined,
        engineScore: Number(form.engineScore),
        bodyScore: Number(form.bodyScore),
        paintScore: Number(form.paintScore),
        interiorScore: Number(form.interiorScore),
        tiresScore: Number(form.tiresScore),
        electricsScore: Number(form.electricsScore),
        basePriceKopecks: Number(form.basePriceKopecks),
        region: form.region,
        city: form.city,
        summary: form.summary,
        expertNotes: form.expertNotes,
        defects: defects.map((d, i) => ({
          id: `def-${i + 1}`,
          view: d.view,
          x: Number(d.x),
          y: Number(d.y),
          type: d.type,
          severity: Number(d.severity),
          title: d.title,
          note: d.note,
        })),
      };

      const created = await api<{ id: string }>("/reports", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await api(`/reports/${created.id}/publish`, { method: "POST" });
      setOk("Отчёт создан и опубликован");
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <div className="page space-y-5">
      <div>
        <h1 className="display text-2xl font-extrabold">Кабинет эксперта</h1>
        <p className="text-sm text-[var(--muted)]">
          Заполни аукционный лист: баллы 1–10, дефекты на схеме, заключение
        </p>
      </div>

      <form className="space-y-4" onSubmit={createReport}>
        <section className="card space-y-3 p-4">
          <h2 className="display font-bold underline-lime">Автомобиль</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {(
              [
                ["title", "Заголовок отчёта"],
                ["make", "Марка"],
                ["model", "Модель"],
                ["year", "Год"],
                ["mileage", "Пробег, км"],
                ["vin", "VIN"],
                ["basePriceKopecks", "Цена отчёта (копейки)"],
                ["region", "Регион"],
                ["city", "Город"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs text-[var(--muted)]">{label}</label>
                <input
                  className="field !pr-4"
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  required={key !== "vin"}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="card space-y-3 p-4">
          <h2 className="display font-bold underline-lime">Оценки 1–10</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {(
              [
                ["bodyScore", "Кузов"],
                ["paintScore", "ЛКП"],
                ["engineScore", "Техника / ТО"],
                ["interiorScore", "Салон"],
                ["tiresScore", "Шины"],
                ["electricsScore", "Электрика"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs text-[var(--muted)]">{label}</label>
                <input
                  className="field !pr-4"
                  type="number"
                  min={1}
                  max={10}
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
        </section>

        <section className="card space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="display font-bold underline-lime">Дефекты на схеме</h2>
            <button
              type="button"
              className="btn btn-dark !py-2 text-xs"
              onClick={() =>
                setDefects((prev) => [
                  ...prev,
                  {
                    view: "side",
                    x: "50",
                    y: "50",
                    type: "scratch",
                    severity: "1",
                    title: "Новый дефект",
                    note: "",
                  },
                ])
              }
            >
              + дефект
            </button>
          </div>

          {defects.map((d, idx) => (
            <div key={idx} className="grid gap-2 rounded-xl border border-[var(--line)] bg-[var(--elev)] p-3 md:grid-cols-3">
              <select
                className="field !pr-4"
                value={d.view}
                onChange={(e) => {
                  const view = e.target.value as DefectForm["view"];
                  setDefects((prev) => prev.map((x, i) => (i === idx ? { ...x, view } : x)));
                }}
              >
                <option value="side">Бок</option>
                <option value="top">Сверху</option>
                <option value="rear">Сзади</option>
                <option value="interior">Салон</option>
              </select>
              <input
                className="field !pr-4"
                placeholder="X %"
                value={d.x}
                onChange={(e) =>
                  setDefects((prev) =>
                    prev.map((x, i) => (i === idx ? { ...x, x: e.target.value } : x)),
                  )
                }
              />
              <input
                className="field !pr-4"
                placeholder="Y %"
                value={d.y}
                onChange={(e) =>
                  setDefects((prev) =>
                    prev.map((x, i) => (i === idx ? { ...x, y: e.target.value } : x)),
                  )
                }
              />
              <select
                className="field !pr-4"
                value={d.type}
                onChange={(e) =>
                  setDefects((prev) =>
                    prev.map((x, i) => (i === idx ? { ...x, type: e.target.value } : x)),
                  )
                }
              >
                <option value="scratch">Царапина</option>
                <option value="dent">Вмятина</option>
                <option value="paint">Перекрас</option>
                <option value="chip">Скол</option>
                <option value="rust">Коррозия</option>
                <option value="other">Прочее</option>
              </select>
              <input
                className="field !pr-4"
                placeholder="Серьёзность 1-3"
                value={d.severity}
                onChange={(e) =>
                  setDefects((prev) =>
                    prev.map((x, i) => (i === idx ? { ...x, severity: e.target.value } : x)),
                  )
                }
              />
              <input
                className="field !pr-4"
                placeholder="Заголовок"
                value={d.title}
                onChange={(e) =>
                  setDefects((prev) =>
                    prev.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)),
                  )
                }
              />
              <input
                className="field !pr-4 md:col-span-3"
                placeholder="Комментарий"
                value={d.note}
                onChange={(e) =>
                  setDefects((prev) =>
                    prev.map((x, i) => (i === idx ? { ...x, note: e.target.value } : x)),
                  )
                }
              />
            </div>
          ))}
        </section>

        <section className="card space-y-3 p-4">
          <h2 className="display font-bold underline-lime">Тексты</h2>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Краткое summary</label>
            <textarea
              className="field min-h-20 !pr-4"
              value={form.summary}
              onChange={(e) => setField("summary", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">
              Развёрнутое заключение
            </label>
            <textarea
              className="field min-h-28 !pr-4"
              value={form.expertNotes}
              onChange={(e) => setField("expertNotes", e.target.value)}
            />
          </div>
        </section>

        {error && <p className="text-[var(--danger)]">{error}</p>}
        {ok && <p className="lime">{ok}</p>}

        <button className="btn btn-lime btn-block" type="submit">
          Создать и опубликовать отчёт
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="display font-bold">Мои отчёты</h2>
        {demoOnly && (
          <p className="text-sm text-[var(--muted)]">
            Демо-сессия: открой клиентом каталог и полный лист Honda Vezel.
          </p>
        )}
        {reports.map((r) => (
          <Link key={r.id} href={`/reports/${r.id}`} className="card block p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-[var(--muted)]">
                  {r.make} {r.model} · {r.status}
                </p>
              </div>
              <span className="price-pill">{formatPrice(r.basePriceKopecks)}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
