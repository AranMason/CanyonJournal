import { Canyon, CanyonFilterOptionsRequest, CanyonListEntry } from "../../types/Canyon"
import { apiFetch, apiGet, apiPost } from "../../utils/api"
import { LimitedAsyncCache } from "../caches/LimitedAsyncCache";
import { PromiseCache } from "../caches/PromiseCache";

const allCanyonsPromiseCache = new PromiseCache(() => apiGet<Canyon[]>('/api/canyons'));

const load = async (): Promise<Canyon[]> => allCanyonsPromiseCache.get();

const canyonCacheById: { [id: number]: Promise<CanyonListEntry> } = {}
const userCanyonCacheById: { [id: number]: Promise<CanyonListEntry> } = {}

async function getCanyonById(id: number): Promise<CanyonListEntry> {
    const cachedVal = canyonCacheById[id];

    if (cachedVal) {
        return cachedVal;
    }

    var promise = apiFetch<CanyonListEntry>(`/api/canyons/${id}?withDescents=1`, {
        method: 'GET'
    })
    canyonCacheById[id] = promise;
    return promise;
}

async function getUserCanyonById(id: number): Promise<CanyonListEntry> {
    const cachedVal = userCanyonCacheById[id];

    if (cachedVal) {
        return cachedVal;
    }

    var promise = apiFetch<CanyonListEntry>(`/api/user-canyons/${id}?withDescents=1`, {
        method: 'GET'
    })
    userCanyonCacheById[id] = promise;
    return promise;
}

async function loadById() {
    var canyons = await load()

    return toDict(canyons, s => s.Id);
}

function toDict<T>(items: T[], getId: (item: T) => number | null | undefined): { [n: number]: T } {
    const dict: { [n: number]: T } = {};
    items.forEach(s => {
        const id = getId(s);
        if (id) {
            dict[id] = s;
        }
    })
    return dict;
};

export {
    load,
    getCanyonById,
    getUserCanyonById,
    loadById
}

/// ------------------------------------
/// Canyon Page
/// ------------------------------------

type CanyonSearchResult = {
    totalCount: number;
    totalPages: number;
    results: CanyonListEntry[]
}

// We only want to store at most 20 pages in memory at a time.
const testCanyonFilterPageCache = new LimitedAsyncCache<string, CanyonSearchResult>(20);

const getFilterKey = (filter: CanyonFilterOptionsRequest): string => JSON.stringify(filter)

export async function getCanyonPage(filter: CanyonFilterOptionsRequest): Promise<CanyonSearchResult> {
    const key = getFilterKey(filter);

    return testCanyonFilterPageCache.getOrInsertAsync(key, () => {
        return apiPost<CanyonSearchResult, CanyonFilterOptionsRequest>('/api/canyons/search', filter);
    });
}