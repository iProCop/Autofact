import { PlatformScoreService } from './platform-score.service';

describe('PlatformScoreService', () => {
  const service = new PlatformScoreService();

  it('returns null when fewer than 3 experts', () => {
    const result = service.calculate([
      { expertId: 'a', overallScore: 4, expertRating: 5 },
      { expertId: 'b', overallScore: 4.2, expertRating: 4 },
    ]);
    expect(result.platformScore).toBeNull();
    expect(result.sampleSize).toBe(2);
  });

  it('computes weighted average for 3+ experts', () => {
    const result = service.calculate([
      { expertId: 'a', overallScore: 8, expertRating: 5 },
      { expertId: 'b', overallScore: 8, expertRating: 5 },
      { expertId: 'c', overallScore: 9, expertRating: 5 },
    ]);
    expect(result.platformScore).toBeCloseTo(8.33, 1);
    expect(result.disputed).toBe(false);
  });

  it('marks disputed when spread > 2.0 on 10-point scale', () => {
    const result = service.calculate([
      { expertId: 'a', overallScore: 5, expertRating: 4 },
      { expertId: 'b', overallScore: 7, expertRating: 4 },
      { expertId: 'c', overallScore: 9, expertRating: 4 },
    ]);
    expect(result.disputed).toBe(true);
  });
});
