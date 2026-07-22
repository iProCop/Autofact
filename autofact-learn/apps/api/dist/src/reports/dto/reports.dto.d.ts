export declare class DefectDto {
    id: string;
    view: string;
    x: number;
    y: number;
    type: string;
    severity: number;
    title: string;
    note?: string;
    photoUrl?: string;
}
export declare class CreateReportDto {
    title: string;
    summary?: string;
    expertNotes?: string;
    vin?: string;
    make: string;
    model: string;
    year: number;
    mileage: number;
    engineScore: number;
    bodyScore: number;
    paintScore: number;
    interiorScore: number;
    tiresScore?: number;
    electricsScore?: number;
    defects?: DefectDto[];
    basePriceKopecks: number;
    region: string;
    city: string;
}
export declare class ListReportsQueryDto {
    make?: string;
    model?: string;
    region?: string;
    page?: number;
    limit?: number;
}
