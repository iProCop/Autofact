export enum CarClass {
    ECONOMY = 'ECONOMY',
    MID = 'MID',
    PREMIUM = 'PREMIUM',
    LUXURY = 'LUXURY',
    RARE = 'RARE',
}

export type PriceBand = {
    minKopecks: number;
    maxKopecks: number;
    recommendedKopecks: number;
}

export const CAR_CLASS_BANDS: Record<CarClass, PriceBand> = {
    [CarClass.ECONOMY]: {
      minKopecks: 80_000,
      maxKopecks: 200_000,
      recommendedKopecks: 120_000,
    },
    [CarClass.MID]: {
      minKopecks: 150_000,
      maxKopecks: 350_000,
      recommendedKopecks: 220_000,
    },
    [CarClass.PREMIUM]: {
      minKopecks: 250_000,
      maxKopecks: 600_000,
      recommendedKopecks: 400_000,
    },
    [CarClass.LUXURY]: {
      minKopecks: 500_000,
      maxKopecks: 1_500_000,
      recommendedKopecks: 800_000,
    },
    [CarClass.RARE]: {
      minKopecks: 500_000,
      maxKopecks: 3_000_000,
      recommendedKopecks: 800_000,
    },
  };