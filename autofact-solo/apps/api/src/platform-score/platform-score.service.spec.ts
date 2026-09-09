import { PlatformScoreService } from './platform-score.service';

describe('PlatformScoreService', () => {
  const service = new PlatformScoreService();

  it('null, если меньше 3 экспертов', () => {
    const result = service.calculate([
      { expertId: 'a', overallScore: 8, expertRating: 5 },
      { expertId: 'b', overallScore: 8.2, expertRating: 4 },
    ]);
    expect(result.platformScore).toBeNull();
    expect(result.disputed).toBe(false);
    expect(result.sampleSize).toBe(2);
  });

  it('один эксперт дважды не считается за двоих', () => {
    const result = service.calculate([
      { expertId: 'a', overallScore: 8, expertRating: 5 },
      { expertId: 'a', overallScore: 9, expertRating: 5 },
      { expertId: 'b', overallScore: 8, expertRating: 5 },
    ]);
    expect(result.platformScore).toBeNull();
    expect(result.sampleSize).toBe(2);
  });

  it('считает взвешенное среднее для 3+ экспертов', () => {
    const result = service.calculate([
      { expertId: 'a', overallScore: 8, expertRating: 5 },
      { expertId: 'b', overallScore: 8, expertRating: 5 },
      { expertId: 'c', overallScore: 9, expertRating: 5 },
    ]);
    expect(result.platformScore).toBeCloseTo(8.33, 1);
    expect(result.disputed).toBe(false);
    expect(result.sampleSize).toBe(3);
  });

  it('disputed, если разброс > 2.0', () => {
    const result = service.calculate([
      { expertId: 'a', overallScore: 5, expertRating: 4 },
      { expertId: 'b', overallScore: 7, expertRating: 4 },
      { expertId: 'c', overallScore: 9, expertRating: 4 },
    ]);
    expect(result.disputed).toBe(true);
    expect(result.platformScore).not.toBeNull();
  });

  it('больший рейтинг эксперта тянет среднее сильнее', () => {
    const result = service.calculate([
      { expertId: 'star', overallScore: 9, expertRating: 5 },
      { expertId: 'mid1', overallScore: 6, expertRating: 1 },
      { expertId: 'mid2', overallScore: 6, expertRating: 1 },
    ]);
    expect(result.platformScore!).toBeGreaterThan(7.5);
    expect(result.disputed).toBe(true);
  });
});
