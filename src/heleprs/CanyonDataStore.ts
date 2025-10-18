import { Canyon } from "../types/Canyon"
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

function toDict<T>(items: T[], getId: (item: T) => number): {[n: number]: T} {
      const dict: {[n: number]: T} = {};
      items.forEach(s => {
        dict[getId(s)] = s;
      })
      return dict;
  };

export {
    load,
    loadById
}