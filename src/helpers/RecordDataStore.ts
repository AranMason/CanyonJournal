import { CanyonRecord } from "../types/CanyonRecord";
import { apiFetch } from "../utils/api";


export const getRecords = async (): Promise<CanyonRecord[]> => {
    const url = `/api/record`;
    const response = await apiFetch<{ records: CanyonRecord[] }>(url);
    return response.records;
}

export const getRecordsForDashboard = async (): Promise<CanyonRecord[]> => {
    const url = `/api/record?max=10`;
    const response = await apiFetch<{ records: CanyonRecord[] }>(url);
    return response.records;
}