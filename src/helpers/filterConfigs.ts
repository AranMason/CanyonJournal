import { FilterConfig } from '../components/FilterPanel';
import * as EquipmentDataStore from './EquipmentDataStore';
import * as TagsDataStore from './TagsDataStore';
import { CanyonTypeList } from '../types/CanyonTypeEnum';
import { GetCanyonTypeDisplayName } from './EnumMapper';
import { apiFetch } from '../utils/api';
import { DataSource } from '../types/DataSource';
import i18n from '../i18n';
import { COMMITMENT_RATINGS } from '../components/CanyonRating';

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
    label: i18n.t('filters.canyonType'),
    labelId: 'canyon-type-filter',
    options: CanyonTypeList.map(t => ({ value: t, label: GetCanyonTypeDisplayName(t) })),
  };
}

export function getVerticalRatingFilterConfig(key = 'verticalRating'): FilterConfig {
  return {
    type: 'multi-select',
    key,
    label: i18n.t('filters.verticalRating'),
    labelId: 'vertical-rating-filter',
    options: [...Array(7).keys()].map(i => ({ value: i + 1, label: `V${i + 1}` })),
  };
}

export function getAquaticRatingFilterConfig(key = 'aquaRating'): FilterConfig {
  return {
    type: 'multi-select',
    key,
    label: i18n.t('filters.aquaticRating'),
    labelId: 'aquatic-rating-filter',
    options: [...Array(7).keys()].map(i => ({ value: i + 1, label: `A${i + 1}` })),
  };
}

export function getStarRatingFilterConfig(key = 'starRating'): FilterConfig {
  return {
    type: 'multi-select',
    key,
    label: i18n.t('filters.starRating'),
    labelId: 'star-rating-filter',
    options: [...Array(6).keys()].map(i => ({ value: i, label: i > 0 ? '★'.repeat(i) : 'None' })),
  };
}

export function getCommitmentRatingFilterConfig(key = 'commitmentRating'): FilterConfig {
  return {
    type: 'multi-select',
    key,
    label: i18n.t('filters.commitmentRating'),
    labelId: 'commitment-rating-filter',
    options: [...Array(7).keys()].map(i => ({ value: i+1, label: COMMITMENT_RATINGS[i] })),
  };
}

export function getRopeFilterConfig(key = 'ropes'): FilterConfig {
  return {
    type: 'async-multi-select',
    key,
    label: i18n.t('filters.ropes'),
    labelId: 'rope-filter',
    loadOptions: () => EquipmentDataStore.load()
      .then(d => d.ropes.map(r => ({ value: r.Id, label: `${r.Name} - ${r.Length} ${r.Unit}` }))),
  };
}

export function getGearFilterConfig(key = 'gear'): FilterConfig {
  return {
    type: 'async-multi-select',
    key,
    label: i18n.t('filters.gear'),
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
      { value: 'all', label: i18n.t('filters.verified.all') },
      { value: 'verified', label: i18n.t('filters.verified.verified') },
      { value: 'unverified', label: i18n.t('filters.verified.unverified') },
    ],
  };
}

export function getTagFilterConfig(key = 'tags'): FilterConfig {
  return {
    type: 'async-multi-select',
    key,
    label: i18n.t('filters.tag'),
    labelId: 'tag-filter',
    loadOptions: () => TagsDataStore.load()
      .then(tags => tags.map(t => ({ value: t.Id, label: t.Name }))),
  };
}

export function getDataSourceConfig(key = 'dataSource'): FilterConfig {
  return {
    type: 'async-multi-select',
    key,
    label: i18n.t('filters.dataSource'),
    labelId: 'data-source-filter',
    loadOptions: () => apiFetch<DataSource[]>('/api/sources', {
      method: 'GET'
    })
      .then(sources => sources.map(s => ({ value: s.Id, label: s.DisplayName }))),
  };
}

export function getHasCanyonDescentsFilterConfig(key = 'hasDescents'): FilterConfig {
  return {
    type: 'single-select',
    key,  
    label: i18n.t('filters.hasDescents.label'),
    labelId: 'has-descents-filter',
    placeholder: i18n.t('filters.hasDescents.all'),
    options: [
      { value: 'yes', label: i18n.t('filters.hasDescents.yes') },
      { value: 'no', label: i18n.t('filters.hasDescents.no') }
    ],
  };
}
