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
export declare class PlatformScoreService {
    calculate(scores: ExpertScoreInput[]): PlatformScoreResult;
    private uniqueByExpert;
}
