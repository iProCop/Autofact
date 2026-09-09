export enum PricingMode {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export enum PricingStrategy {
  FAST = 'FAST',
  BALANCE = 'BALANCE',
  MAX_PROFIT = 'MAX_PROFIT',
}

export const STRATEGY_MULTIPLIER: Record<PricingStrategy, number> = {
  [PricingStrategy.FAST]: 0.85,
  [PricingStrategy.BALANCE]: 1,
  [PricingStrategy.MAX_PROFIT]: 1.2,
};
