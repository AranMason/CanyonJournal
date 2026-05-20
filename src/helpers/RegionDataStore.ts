import { apiFetch } from '../utils/api';
import { Region } from '../types/Region';
import i18n from '../i18n';

let cache: Promise<Region[]> | null = null;

function resolveNames(nodes: any[]): Region[] {
  return nodes.map(n => ({
    ...n,
    Name: i18n.t(`regions:${n.Slug}`, { defaultValue: n.Slug }),
    Children: resolveNames(n.Children ?? []),
  }));
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
export function getDescendantIds(regionId: number, flat: Region[]): number[] {
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
