import { PrismaClient, Role, ReportStatus, MediaType, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.purchase.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.reportMedia.deleteMany();
  await prisma.carReport.deleteMany();
  await prisma.expertReview.deleteMany();
  await prisma.customOrder.deleteMany();
  await prisma.expertProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const expertsData = [
    {
      email: 'expert@autoinspect.local',
      fullName: 'Владимир АвтоМастер',
      region: 'Москва',
      city: 'Москва',
      bio: 'Независимый осмотр, ЛКП, эндоскоп.',
      specializations: ['кузов', 'ЛКП', 'двигатель'],
      rating: 4.8,
      inspectionsCount: 312,
      salesCount: 52,
    },
    {
      email: 'expert2@autoinspect.local',
      fullName: 'Анна Смирнова',
      region: 'Москва',
      city: 'Москва',
      bio: 'Салон и история ДТП.',
      specializations: ['салон', 'документы'],
      rating: 4.9,
      inspectionsCount: 280,
      salesCount: 67,
    },
    {
      email: 'expert3@autoinspect.local',
      fullName: 'Сергей Козлов',
      region: 'Московская область',
      city: 'Химки',
      bio: 'Выезд по области.',
      specializations: ['ходовая', 'электрика'],
      rating: 4.6,
      inspectionsCount: 198,
      salesCount: 41,
    },
    {
      email: 'expert4@autoinspect.local',
      fullName: 'Дмитрий Орлов',
      region: 'Санкт-Петербург',
      city: 'Санкт-Петербург',
      bio: 'Подбор и аукционы.',
      specializations: ['подбор', 'аукционы'],
      rating: 4.7,
      inspectionsCount: 245,
      salesCount: 58,
    },
    {
      email: 'expert5@autoinspect.local',
      fullName: 'Елена Васильева',
      region: 'Казань',
      city: 'Казань',
      bio: 'Кроссоверы и семейные авто.',
      specializations: ['кроссоверы'],
      rating: 4.5,
      inspectionsCount: 156,
      salesCount: 29,
    },
  ];

  const experts = [];
  for (const e of expertsData) {
    const user = await prisma.user.create({
      data: {
        email: e.email,
        passwordHash,
        role: Role.EXPERT,
        expert: {
          create: {
            fullName: e.fullName,
            region: e.region,
            city: e.city,
            bio: e.bio,
            specializations: e.specializations,
            rating: e.rating,
            inspectionsCount: e.inspectionsCount,
            salesCount: e.salesCount,
          },
        },
      },
      include: { expert: true },
    });
    experts.push(user.expert!);
  }

  await prisma.user.create({
    data: {
      email: 'client@autoinspect.local',
      passwordHash,
      role: Role.CLIENT,
      client: { create: {} },
    },
  });

  const covers = [
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555215695-3004980ad094?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=900&q=80',
  ];

  const vezelDefects = [
    {
      id: 'd1',
      view: 'side',
      x: 28,
      y: 42,
      type: 'scratch',
      severity: 1,
      title: 'Царапина на передней двери',
      note: 'Поверхностная, до грунта не доходит.',
      photoUrl:
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'd2',
      view: 'side',
      x: 72,
      y: 55,
      type: 'dent',
      severity: 2,
      title: 'Лёгкая вмятина заднего крыла',
      note: 'Без нарушения ЛКП.',
    },
    {
      id: 'd3',
      view: 'top',
      x: 55,
      y: 35,
      type: 'paint',
      severity: 2,
      title: 'Перекрас капота',
      note: 'Толщиномер 180–220 мкм.',
    },
    {
      id: 'd4',
      view: 'rear',
      x: 48,
      y: 40,
      type: 'chip',
      severity: 1,
      title: 'Скол на бампере',
      note: 'Точечный скол.',
    },
    {
      id: 'd5',
      view: 'interior',
      x: 35,
      y: 45,
      type: 'other',
      severity: 1,
      title: 'Потёртость сиденья',
      note: 'Боковая поддержка.',
    },
  ];

  const reports = [
    {
      title: 'Honda Vezel 2016 — полный аукционный лист',
      make: 'Honda',
      model: 'Vezel',
      year: 2016,
      mileage: 125000,
      scores: { tech: 9, body: 8, paint: 7, interior: 8, tires: 7, electrics: 9 },
      price: 149000,
      expert: 0,
      vin: 'JHMRV1850G0001111',
      city: 'Москва',
      region: 'Москва',
      defects: vezelDefects,
      notes:
        'Рекомендую покупку. Капот в перекрасе (аккуратно). Ходовая без люфтов. Салон ухожен.',
    },
    {
      title: 'Nissan Murano 2018 — без окрасов',
      make: 'Nissan',
      model: 'Murano',
      year: 2018,
      mileage: 78000,
      scores: { tech: 9, body: 9, paint: 9, interior: 8, tires: 8, electrics: 9 },
      price: 189000,
      expert: 1,
      vin: 'JN8AZ1MU8JW011111',
      city: 'Москва',
      region: 'Москва',
      defects: [],
      notes: 'Кузов родной. Отличный экземпляр.',
    },
    {
      title: 'Subaru Forester 2017 — спорный',
      make: 'Subaru',
      model: 'Forester',
      year: 2017,
      mileage: 142000,
      scores: { tech: 6, body: 6, paint: 5, interior: 7, tires: 6, electrics: 7 },
      price: 99000,
      expert: 2,
      vin: 'JF2SJADC0HH011111',
      city: 'Химки',
      region: 'Московская область',
      defects: [
        {
          id: 's1',
          view: 'side',
          x: 40,
          y: 50,
          type: 'dent',
          severity: 3,
          title: 'Вмятина порога',
          note: 'Возможен удар снизу.',
        },
      ],
      notes: 'Нужна диагностика рамы. Торг обязателен.',
    },
    {
      title: 'Toyota Camry 2019 — осмотр #1',
      make: 'Toyota',
      model: 'Camry',
      year: 2019,
      mileage: 78000,
      scores: { tech: 8, body: 8, paint: 8, interior: 9, tires: 8, electrics: 8 },
      price: 250000,
      expert: 0,
      vin: 'XW8ZZZ61ZDG012345',
      city: 'Москва',
      region: 'Москва',
      defects: [],
      notes: 'Состояние выше среднего.',
    },
    {
      title: 'Toyota Camry 2019 — осмотр #2',
      make: 'Toyota',
      model: 'Camry',
      year: 2019,
      mileage: 78100,
      scores: { tech: 8, body: 9, paint: 8, interior: 8, tires: 8, electrics: 8 },
      price: 240000,
      expert: 1,
      vin: 'XW8ZZZ61ZDG012345',
      city: 'Москва',
      region: 'Москва',
      defects: [],
      notes: 'Согласен с коллегой.',
    },
    {
      title: 'Toyota Camry 2019 — осмотр #3',
      make: 'Toyota',
      model: 'Camry',
      year: 2019,
      mileage: 77900,
      scores: { tech: 9, body: 8, paint: 8, interior: 8, tires: 9, electrics: 8 },
      price: 230000,
      expert: 2,
      vin: 'XW8ZZZ61ZDG012345',
      city: 'Москва',
      region: 'Москва',
      defects: [],
      notes: 'Мелочи по ЛКП.',
    },
    {
      title: 'Kia Sportage 2021 — почти новый',
      make: 'Kia',
      model: 'Sportage',
      year: 2021,
      mileage: 42000,
      scores: { tech: 9, body: 9, paint: 9, interior: 9, tires: 9, electrics: 9 },
      price: 199000,
      expert: 1,
      vin: 'XWEPH81ABMA123456',
      city: 'Москва',
      region: 'Москва',
      defects: [],
      notes: 'Почти идеал.',
    },
    {
      title: 'BMW X5 2016 — высокие баллы',
      make: 'BMW',
      model: 'X5',
      year: 2016,
      mileage: 110000,
      scores: { tech: 8, body: 8, paint: 7, interior: 8, tires: 7, electrics: 8 },
      price: 350000,
      expert: 3,
      vin: 'WBAKB8C50BC111111',
      city: 'Санкт-Петербург',
      region: 'Санкт-Петербург',
      defects: [
        {
          id: 'b1',
          view: 'top',
          x: 50,
          y: 30,
          type: 'paint',
          severity: 2,
          title: 'Перекрас крыши',
          note: 'Аккуратно.',
        },
      ],
      notes: 'Техника живая, кузов с косметикой.',
    },
    {
      title: 'Volkswagen Polo 2015 — бюджет',
      make: 'Volkswagen',
      model: 'Polo',
      year: 2015,
      mileage: 168000,
      scores: { tech: 6, body: 5, paint: 5, interior: 6, tires: 5, electrics: 6 },
      price: 70000,
      expert: 4,
      vin: 'WVWZZZ6RZFY011111',
      city: 'Казань',
      region: 'Казань',
      defects: [],
      notes: 'Бюджетный вариант, много косметики.',
    },
    {
      title: 'Lexus RX 2020 — гибрид',
      make: 'Lexus',
      model: 'RX',
      year: 2020,
      mileage: 54000,
      scores: { tech: 9, body: 9, paint: 9, interior: 9, tires: 8, electrics: 9 },
      price: 400000,
      expert: 0,
      vin: '2T2BZMCA0LC111111',
      city: 'Москва',
      region: 'Москва',
      defects: [],
      notes: 'Минимальные риски.',
    },
  ];

  for (let i = 0; i < reports.length; i++) {
    const r = reports[i];
    const s = r.scores;
    const overall =
      (s.tech + s.body + s.paint + s.interior + s.tires + s.electrics) / 6;

    await prisma.carReport.create({
      data: {
        expertId: experts[r.expert].id,
        title: r.title,
        summary:
          'Осмотр по чек-листу АвтоФакт. Интерактивная карта дефектов и баллы 1–10.',
        expertNotes: r.notes,
        vin: r.vin,
        make: r.make,
        model: r.model,
        year: r.year,
        mileage: r.mileage,
        engineScore: s.tech,
        bodyScore: s.body,
        paintScore: s.paint,
        interiorScore: s.interior,
        tiresScore: s.tires,
        electricsScore: s.electrics,
        expertOverallScore: overall,
        defects: r.defects as Prisma.InputJsonValue,
        basePriceKopecks: r.price,
        region: r.region,
        city: r.city,
        status: ReportStatus.PUBLISHED,
        publishedAt: new Date(),
        media: {
          create: [
            {
              type: MediaType.PHOTO,
              url: covers[i % covers.length],
              sortOrder: 0,
            },
            {
              type: MediaType.PHOTO,
              url: covers[(i + 2) % covers.length],
              sortOrder: 1,
            },
            {
              type: MediaType.PHOTO,
              url: covers[(i + 4) % covers.length],
              sortOrder: 2,
            },
          ],
        },
      },
    });
  }

  const camryVin = 'XW8ZZZ61ZDG012345';
  const camry = await prisma.carReport.findMany({
    where: { vin: camryVin },
    include: { expert: true },
  });
  let w = 0;
  let ws = 0;
  for (const c of camry) {
    const rating = Number(c.expert.rating);
    w += Number(c.expertOverallScore) * rating;
    ws += rating;
  }
  const platformScore = Math.round((w / ws) * 100) / 100;
  await prisma.carReport.updateMany({
    where: { vin: camryVin },
    data: { platformScore },
  });

  console.log('Seed OK: auction-sheet reports ready');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
