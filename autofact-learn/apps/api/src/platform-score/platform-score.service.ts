import { Injectable } from '@nestjs/common';

export type ExpertScoreInput = {
  expertId: string;
  overallScore: number;
  expertRating: number;
};

export type PlatformScoreResult = {
  platformScore: number | null;
  disputed: boolean;
  sampleSize: number;
};

@Injectable()
export class PlatformScoreService {
  /**
   * Weighted average by expert rating when >= 3 independent reports.
   * Dispute if max-min spread > 20% of 10-point scale (threshold 2.0).
   */
  calculate(scores: ExpertScoreInput[]): PlatformScoreResult {
    const unique = this.uniqueByExpert(scores);
    if (unique.length < 3) {
      return { platformScore: null, disputed: false, sampleSize: unique.length };
    }

    const values = unique.map((s) => s.overallScore);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const disputed = max - min > 2.0;

    let weightSum = 0;
    let weighted = 0;
    for (const item of unique) {
      const w = Math.max(Number(item.expertRating), 0.1);
      weighted += item.overallScore * w;
      weightSum += w;
    }

    const platformScore = Math.round((weighted / weightSum) * 100) / 100;
    return { platformScore, disputed, sampleSize: unique.length };
  }

  private uniqueByExpert(scores: ExpertScoreInput[]): ExpertScoreInput[] {
    const map = new Map<string, ExpertScoreInput>();
    for (const s of scores) {
      if (!map.has(s.expertId)) map.set(s.expertId, s);
    }
    return [...map.values()];
  }
}
