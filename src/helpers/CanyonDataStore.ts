import { Canyon, CanyonFilterOptionsRequest, CanyonListEntry } from "../types/Canyon"
import { apiFetch } from "../utils/api"

var loadPromise: Promise<Canyon[]> | null = null;

async function load(): Promise<Canyon[]> {

    loadPromise ??= new Promise<Canyon[]>(async (res, rej) => {
        apiFetch<Canyon[]>('/api/canyons').then(s => {
            res(s);
        }).catch(() => rej());
    });

    return await loadPromise;
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
type CanyonsByFilterKey = {
    [filter: string]: Promise<CanyonSearchResult>
}


let canyonFilterPageCache: CanyonsByFilterKey = {};

const getFilterKey = (filter: CanyonFilterOptionsRequest): string => JSON.stringify(filter)

export async function getCanyonPage(filter: CanyonFilterOptionsRequest): Promise<CanyonSearchResult> {

    const key = getFilterKey(filter);

    const data = canyonFilterPageCache[key];

    if (data) {
        return data;
    }

    const dataLoadPromise = apiFetch<CanyonSearchResult>('/api/canyons/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter)
    });

    canyonFilterPageCache[key] = dataLoadPromise;

    return dataLoadPromise;
}