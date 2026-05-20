export interface Region {
  Id: number;
  ParentId: number | null;
  Slug: string;
  Symbol?: string | null;
  SortOrder: number;
  /** Resolved client-side from the 'regions' i18n namespace using Slug. */
  Name: string;
  Children: Region[];
}

/** Shape returned by GET /api/regions/:id (admin). No translations — names are in JSON locale files. */
export interface RegionAdmin {
  Id: number;
  ParentId: number | null;
  Slug: string;
  Symbol?: string | null;
  SortOrder: number;
  IsActive: boolean;
}
