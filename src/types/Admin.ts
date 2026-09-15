import { CanyonData } from "../../routes/types/Canyon.type";

export type AdminFilter = {
    page: number,
    pageSize: number,
    isVerified: boolean | null,
    text: string
    dataSourceId: number | null;
}

export type AdminFilterResults = {
    totalCanyons: number;
    totalPages: number;
    results: CanyonData[];
}