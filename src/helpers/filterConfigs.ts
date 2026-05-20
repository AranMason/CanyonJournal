import { FilterConfig } from '../components/FilterPanel';
import * as EquipmentDataStore from './EquipmentDataStore';
import * as TagsDataStore from './TagsDataStore';
import { CanyonTypeList } from '../types/CanyonTypeEnum';
import { GetCanyonTypeDisplayName } from './EnumMapper';

// ─── Individual filter building blocks ────────────────────────────────────────

export function getCanyonNameFilterConfig(key = 'name'): FilterConfig {
  return { type: 'text', key, label: 'Canyon Name' };
}

/** Region tree filter — uses RegionTreePicker dialog in FilterPanel. */
export function getRegionFilterConfig(key = 'region', availableRegionIds?: number[]): FilterConfig {
  return { type: 'region-tree', key, availableRegionIds };
}

export function getCanyonTypeFilterConfig(key = 'type'): FilterConfig {
  return {
    type: 'multi-select',
    key,
    label: 'Canyon Type',
    labelId: 'canyon-type-filter',
    options: CanyonTypeList.map(t => ({ value: t, label: GetCanyonTypeDisplayName(t) })),
  };
}

export function getVerticalRatingFilterConfig(key = 'verticalRating'): FilterConfig {
  return {
    type: 'multi-select',
    key,
    label: 'Vertical Rating',
    labelId: 'vertical-rating-filter',
    options: [...Array(7).keys()].map(i => ({ value: i + 1, label: `V${i + 1}` })),
  };
}

export function getAquaticRatingFilterConfig(key = 'aquaRating'): FilterConfig {
  return {
    type: 'multi-select',
    key,
    label: 'Aquatic Rating',
    labelId: 'aquatic-rating-filter',
    options: [...Array(7).keys()].map(i => ({ value: i + 1, label: `A${i + 1}` })),
  };
}

export function getStarRatingFilterConfig(key = 'starRating'): FilterConfig {
  return {
    type: 'multi-select',
    key,
    label: 'Star Rating',
    labelId: 'star-rating-filter',
    options: [...Array(6).keys()].map(i => ({ value: i, label: i > 0 ? '★'.repeat(i) : 'None' })),
  };
}

export function getRopeFilterConfig(key = 'ropes'): FilterConfig {
  return {
    type: 'async-multi-select',
    key,
    label: 'Ropes',
    labelId: 'rope-filter',
    loadOptions: () => EquipmentDataStore.load()
      .then(d => d.ropes.map(r => ({ value: r.Id, label: `${r.Name} - ${r.Length} ${r.Unit}` }))),
  };
}

export function getGearFilterConfig(key = 'gear'): FilterConfig {
  return {
    type: 'async-multi-select',
    key,
    label: 'Gear',
    labelId: 'gear-filter',
    loadOptions: () => EquipmentDataStore.load()
      .then(d => d.gear.map(g => ({ value: g.Id, label: g.Name, group: g.Category }))),
  };
}

export function getVerifiedFilterConfig(key = 'verified'): FilterConfig {
  return {
    type: 'exclusive-toggle',
    key,
    options: [
      { value: 'all', label: 'All' },
      { value: 'verified', label: 'Verified' },
      { value: 'unverified', label: 'Unverified' },
    ],
  };
}

export function getTagFilterConfig(key = 'tags'): FilterConfig {
  return {
    type: 'async-multi-select',
    key,
    label: 'Tags',
    labelId: 'tag-filter',
    loadOptions: () => TagsDataStore.load()
      .then(tags => tags.map(t => ({ value: t.Id, label: t.Name }))),
  };
}

