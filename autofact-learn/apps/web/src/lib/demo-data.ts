import type { ReportListItem } from "@/lib/api";
import type { DefectMarker } from "@/components/auction-sheet";

export type DemoExpert = {
  id: string;
  fullName: string;
  rating: number;
  inspectionsCount: number;
  salesCount: number;
  region: string;
  city: string;
  bio: string;
  specializations: string[];
  avatarUrl: string;
  priceLabel: string;
};

export type DemoSpecs = {
  engine: string;
  drive: string;
  transmission: string;
};

export const DEMO_EXPERTS: DemoExpert[] = [
  {
    id: "exp-1",
    fullName: "Владимир АвтоМастер",
    rating: 4.8,
    inspectionsCount: 312,
    salesCount: 52,
    region: "Москва",
    city: "Москва",
    bio: "Независимый осмотр, ЛКП, эндоскоп.",
    specializations: ["кузов", "ЛКП", "двигатель"],
    avatarUrl:
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=400&q=80",
    priceLabel: "3000₽",
  },
  {
    id: "exp-2",
    fullName: "Анна Смирнова",
    rating: 4.9,
    inspectionsCount: 280,
    salesCount: 67,
    region: "Москва",
    city: "Москва",
    bio: "Чистота салона и история ДТП.",
    specializations: ["салон", "документы"],
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    priceLabel: "3500₽",
  },
  {
    id: "exp-3",
    fullName: "Сергей Козлов",
    rating: 4.6,
    inspectionsCount: 198,
    salesCount: 41,
    region: "Московская область",
    city: "Химки",
    bio: "Выезд по области.",
    specializations: ["ходовая", "электрика"],
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    priceLabel: "2800₽",
  },
  {
    id: "exp-4",
    fullName: "Дмитрий Орлов",
    rating: 4.7,
    inspectionsCount: 245,
    salesCount: 58,
    region: "Санкт-Петербург",
    city: "Санкт-Петербург",
    bio: "Подбор и аукционы.",
    specializations: ["подбор"],
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    priceLabel: "3200₽",
  },
  {
    id: "exp-5",
    fullName: "Елена Васильева",
    rating: 4.5,
    inspectionsCount: 156,
    salesCount: 29,
    region: "Казань",
    city: "Казань",
    bio: "Кроссоверы.",
    specializations: ["кроссоверы"],
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    priceLabel: "2500₽",
  },
];

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString();
};

export const DEMO_SPECS: Record<string, DemoSpecs> = {
  "demo-r1": { engine: "Бензин, 1.5L", drive: "Полный", transmission: "Вариатор" },
  "demo-r2": { engine: "Бензин, 3.5L", drive: "Полный", transmission: "Автомат" },
  "demo-r3": { engine: "Бензин, 2.5L", drive: "Полный", transmission: "Автомат" },
  "demo-r4": { engine: "Бензин, 2.5L", drive: "Передний", transmission: "Автомат" },
  "demo-r5": { engine: "Бензин, 2.0L", drive: "Полный", transmission: "Робот" },
  "demo-r6": { engine: "Дизель, 3.0L", drive: "Полный", transmission: "Автомат" },
  "demo-r7": { engine: "Бензин, 1.6L", drive: "Передний", transmission: "Механика" },
  "demo-r8": { engine: "Гибрид, 2.5L", drive: "Полный", transmission: "Вариатор" },
};

const VEZEL_DEFECTS: DefectMarker[] = [
  {
    id: "d1",
    view: "side",
    x: 28,
    y: 42,
    type: "scratch",
    severity: 1,
    title: "Царапина на передней двери",
    note: "Поверхностная, до грунта не доходит. Длина ~12 см.",
    photoUrl:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "d2",
    view: "side",
    x: 72,
    y: 55,
    type: "dent",
    severity: 2,
    title: "Лёгкая вмятина заднего крыла",
    note: "Без нарушения ЛКП. Рекомендована рихтовка.",
  },
  {
    id: "d3",
    view: "top",
    x: 55,
    y: 35,
    type: "paint",
    severity: 2,
    title: "Перекрас капота",
    note: "Толщиномер: 180–220 мкм (завод ~110). Подгонка стыков ровная.",
  },
  {
    id: "d4",
    view: "rear",
    x: 48,
    y: 40,
    type: "chip",
    severity: 1,
    title: "Скол на бампере",
    note: "Точечный скол под покраску.",
  },
  {
    id: "d5",
    view: "interior",
    x: 35,
    y: 45,
    type: "other",
    severity: 1,
    title: "Потёртость сиденья водителя",
    note: "Боковая поддержка, ткань. Критичности нет.",
  },
];

export const DEMO_REPORTS: ReportListItem[] = [
  {
    id: "demo-r1",
    title: "Honda Vezel 2016 — полный аукционный лист",
    make: "Honda",
    model: "Vezel",
    year: 2016,
    mileage: 125000,
    region: "Москва",
    city: "Москва",
    status: "PUBLISHED",
    expertOverallScore: 8.2,
    platformScore: 8.0,
    priceKopecks: 149000,
    priceMultiplier: 1,
    ageDays: 1,
    coverUrl:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
    createdAt: day(2),
    expert: {
      id: "exp-1",
      fullName: "Владимир АвтоМастер",
      rating: 4.8,
      region: "Москва",
      city: "Москва",
    },
  },
  {
    id: "demo-r2",
    title: "Nissan Murano 2018 — без окрасов",
    make: "Nissan",
    model: "Murano",
    year: 2018,
    mileage: 78000,
    region: "Москва",
    city: "Москва",
    status: "PUBLISHED",
    expertOverallScore: 8.8,
    platformScore: null,
    priceKopecks: 189000,
    priceMultiplier: 1,
    ageDays: 3,
    coverUrl:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80",
    createdAt: day(3),
    expert: {
      id: "exp-2",
      fullName: "Анна Смирнова",
      rating: 4.9,
      region: "Москва",
      city: "Москва",
    },
  },
  {
    id: "demo-r3",
    title: "Subaru Forester 2017 — спорный консенсус",
    make: "Subaru",
    model: "Forester",
    year: 2017,
    mileage: 142000,
    region: "Московская область",
    city: "Химки",
    status: "DISPUTED",
    expertOverallScore: 6.4,
    platformScore: 6.1,
    priceKopecks: 99000,
    priceMultiplier: 0.8,
    ageDays: 6,
    coverUrl:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80",
    createdAt: day(6),
    expert: {
      id: "exp-3",
      fullName: "Сергей Козлов",
      rating: 4.6,
      region: "Московская область",
      city: "Химки",
    },
  },
  {
    id: "demo-r4",
    title: "Toyota Camry 2019 — консенсус 3 экспертов",
    make: "Toyota",
    model: "Camry",
    year: 2019,
    mileage: 78000,
    region: "Москва",
    city: "Москва",
    status: "PUBLISHED",
    expertOverallScore: 8.4,
    platformScore: 8.3,
    priceKopecks: 250000,
    priceMultiplier: 1,
    ageDays: 1,
    coverUrl:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80",
    createdAt: day(1),
    expert: {
      id: "exp-1",
      fullName: "Владимир АвтоМастер",
      rating: 4.8,
      region: "Москва",
      city: "Москва",
    },
  },
  {
    id: "demo-r5",
    title: "Kia Sportage 2021 — почти новый",
    make: "Kia",
    model: "Sportage",
    year: 2021,
    mileage: 42000,
    region: "Москва",
    city: "Москва",
    status: "PUBLISHED",
    expertOverallScore: 9.1,
    platformScore: null,
    priceKopecks: 199000,
    priceMultiplier: 1,
    ageDays: 0,
    coverUrl:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
    createdAt: day(0),
    expert: {
      id: "exp-2",
      fullName: "Анна Смирнова",
      rating: 4.9,
      region: "Москва",
      city: "Москва",
    },
  },
  {
    id: "demo-r6",
    title: "BMW X5 2016 — высокие баллы",
    make: "BMW",
    model: "X5",
    year: 2016,
    mileage: 110000,
    region: "Санкт-Петербург",
    city: "Санкт-Петербург",
    status: "PUBLISHED",
    expertOverallScore: 8.0,
    platformScore: 7.9,
    priceKopecks: 350000,
    priceMultiplier: 1,
    ageDays: 2,
    coverUrl:
      "https://images.unsplash.com/photo-1555215695-3004980ad094?auto=format&fit=crop&w=900&q=80",
    createdAt: day(2),
    expert: {
      id: "exp-4",
      fullName: "Дмитрий Орлов",
      rating: 4.7,
      region: "Санкт-Петербург",
      city: "Санкт-Петербург",
    },
  },
  {
    id: "demo-r7",
    title: "Volkswagen Polo 2015 — бюджет",
    make: "Volkswagen",
    model: "Polo",
    year: 2015,
    mileage: 168000,
    region: "Казань",
    city: "Казань",
    status: "PUBLISHED",
    expertOverallScore: 5.8,
    platformScore: null,
    priceKopecks: 70000,
    priceMultiplier: 0.5,
    ageDays: 15,
    coverUrl:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80",
    createdAt: day(15),
    expert: {
      id: "exp-5",
      fullName: "Елена Васильева",
      rating: 4.5,
      region: "Казань",
      city: "Казань",
    },
  },
  {
    id: "demo-r8",
    title: "Lexus RX 2020 — гибрид, минимум рисков",
    make: "Lexus",
    model: "RX",
    year: 2020,
    mileage: 54000,
    region: "Москва",
    city: "Москва",
    status: "PUBLISHED",
    expertOverallScore: 9.0,
    platformScore: 8.9,
    priceKopecks: 400000,
    priceMultiplier: 1,
    ageDays: 1,
    coverUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    createdAt: day(1),
    expert: {
      id: "exp-1",
      fullName: "Владимир АвтоМастер",
      rating: 4.8,
      region: "Москва",
      city: "Москва",
    },
  },
];

export function getDemoReportDetail(id: string, unlocked = false) {
  const report = DEMO_REPORTS.find((r) => r.id === id) ?? DEMO_REPORTS[0];
  const specs = DEMO_SPECS[report.id] ?? DEMO_SPECS["demo-r1"];
  const defects = report.id === "demo-r1" || unlocked ? VEZEL_DEFECTS : VEZEL_DEFECTS.slice(0, 2);

  const scores = {
    bodyScore: Math.round(report.expertOverallScore),
    paintScore: Math.max(1, Math.round(report.expertOverallScore) - 1),
    techScore: Math.min(10, Math.round(report.expertOverallScore) + 1),
    interiorScore: Math.round(report.expertOverallScore),
    tiresScore: 7,
    electricsScore: 8,
    overall: report.expertOverallScore,
  };

  // richer fixed scores for flagship demo
  if (report.id === "demo-r1") {
    scores.bodyScore = 8;
    scores.paintScore = 7;
    scores.techScore = 9;
    scores.interiorScore = 8;
    scores.tiresScore = 7;
    scores.electricsScore = 9;
    scores.overall = 8.2;
  }

  const media = [
    {
      id: "m1",
      type: "PHOTO",
      url:
        report.coverUrl ??
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "m2",
      type: "PHOTO",
      url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "m3",
      type: "PHOTO",
      url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "m4",
      type: "PHOTO",
      url: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return {
    ...report,
    disputed: report.status === "DISPUTED",
    archived: false,
    purchased: unlocked,
    isOwner: false,
    locked: !unlocked,
    scores,
    specs,
    expert: {
      ...report.expert,
      bio: DEMO_EXPERTS.find((e) => e.id === report.expert.id)?.bio ?? "",
      specializations:
        DEMO_EXPERTS.find((e) => e.id === report.expert.id)?.specializations ?? [],
    },
    media: unlocked ? media : media.slice(0, 1),
    inspection: unlocked
      ? {
          vin: "JHMRV1850G0001111",
          summary:
            "Автомобиль в хорошем состоянии для возраста и пробега. Следов силовых ударов не обнаружено.",
          expertNotes:
            "Рекомендую покупку. Капот в перекрасе (аккуратно). Ходовая без люфтов, масло чистое, компрессия ровная. Салон ухожен. Торг уместен из‑за косметики кузова.",
          ...scores,
          defects,
          mileage: report.mileage,
        }
      : null,
    defects: unlocked ? defects : defects.slice(0, 2),
  };
}
