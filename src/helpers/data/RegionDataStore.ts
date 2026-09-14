import { apiDelete, apiFetch } from '../../utils/api';
import { Region } from '../../types/Region';
import { GetRegionDisplayName } from '../RegionHelper';

let cache: Promise<Region[]> | null = null;

function resolveNames(nodes: any[]): Region[] {
  return nodes
    .map(n => ({
      ...n,
      Name: GetRegionDisplayName(n.Slug),
      Children: resolveNames(n.Children ?? []),
    }))
    .sort((a, b) => a.SortOrder - b.SortOrder || a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }));
}

/** Returns the full region tree (nested) from the API, cached for the session. */
export function loadTree(): Promise<Region[]> {
  if (!cache) {
    cache = apiFetch<any[]>('/api/regions').then(resolveNames);
  }
  return cache;
}

/** Returns a flat list of all regions. */
export async function load(): Promise<Region[]> {
  const tree = await loadTree();
  return flatten(tree);
}

function flatten(nodes: Region[]): Region[] {
  const result: Region[] = [];
  const visit = (node: Region) => {
    result.push(node);
    node.Children.forEach(visit);
  };
  nodes.forEach(visit);
  return result;
}

/**
 * Returns all descendant region IDs for the given regionId (inclusive of the
 * given ID itself). Used for hierarchical filter matching: selecting "United Kingdom"
 * should match canyons tagged Scotland, England, Wales, etc.
 */
export async function getDescendantIds(regionId: number): Promise<number[]> {
  const flat = await load();

  const map = new Map<number, number[]>();
  flat.forEach(r => {
    if (r.ParentId != null) {
      if (!map.has(r.ParentId)) map.set(r.ParentId, []);
      map.get(r.ParentId)!.push(r.Id);
    }
  });

  const result: number[] = [];
  const visit = (id: number) => {
    result.push(id);
    (map.get(id) ?? []).forEach(visit);
  };
  visit(regionId);
  return result;
}

/** Invalidate cache (e.g. after admin edits a region). */
export function invalidate(): void {
  cache = null;
}

export async function deleteRegion(id: number): Promise<void> {
  await apiDelete(`/api/regions/${id}`)
}

type RegionRequest = {
  parentId: number | null,
  slug: string,
  symbol: string | null,
  sortOrder: number,
  isActive: boolean,
}

export async function updateRegion(id: number, body: RegionRequest): Promise<void> {
  await apiFetch(`/api/regions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export async function createRegion(body: RegionRequest): Promise<void> {
  await apiFetch('/api/regions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}
