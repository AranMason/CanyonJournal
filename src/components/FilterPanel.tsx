import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Chip, FormControl, InputLabel, ListSubheader,
  MenuItem, Select, TextField, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import MultiSelectChipFilter from './MultiSelectChipFilter';
import RegionTreePicker from './RegionTreePicker';

export type TextFilterConfig = {
  type: 'text';
  key: string;
  label: string;
};

export type MultiSelectFilterConfig<V extends string | number = string | number> = {
  type: 'multi-select';
  key: string;
  label: string;
  labelId: string;
  options: { value: V; label: string }[];
};

export type SingleSelectFilterConfig<V extends string | number = string | number> = {
  type: 'single-select';
  key: string;
  label: string;
  labelId: string;
  /** Shown as the empty/all option. Defaults to "All {label}s" */
  placeholder?: string;
  options: { value: V; label: string }[];
};

export type ExclusiveToggleFilterConfig = {
  type: 'exclusive-toggle';
  key: string;
  options: { value: string; label: string }[];
};

export type AsyncMultiSelectFilterConfig = {
  type: 'async-multi-select';
  key: string;
  label: string;
  labelId: string;
  /** Called once on mount. Options with a `group` field render ListSubheader separators. */
  loadOptions: () => Promise<{ value: number; label: string; group?: string }[]>;
};

export type RegionTreeFilterConfig = {
  type: 'region-tree';
  key: string;
  label?: string;
  /** When provided, only regions the user has canyons in (and their ancestors) are shown. */
  availableRegionIds?: number[];
};

export type FilterConfig =
  | TextFilterConfig
  | MultiSelectFilterConfig<any>
  | SingleSelectFilterConfig<any>
  | ExclusiveToggleFilterConfig
  | AsyncMultiSelectFilterConfig
  | RegionTreeFilterConfig;

export type FilterValues = Record<string, any>;

function getDefaultValue(config: FilterConfig): any {
  switch (config.type) {
    case 'text': return '';
    case 'multi-select': return [];
    case 'single-select': return '';
    case 'exclusive-toggle': return config.options[0]?.value ?? '';
    case 'async-multi-select': return [];
    case 'region-tree': return null;
  }
}

function buildDefaults(configs: FilterConfig[]): FilterValues {
  const defaults: FilterValues = {};
  configs.forEach(c => { defaults[c.key] = getDefaultValue(c); });
  return defaults;
}

interface FilterPanelProps<T> {
  items: T[];
  config: FilterConfig[];
  filterFn: (item: T, values: FilterValues) => boolean;
  children: (filteredItems: T[]) => React.ReactNode;
  /** Pre-populate specific filter keys on first render (e.g. from URL search params). */
  initialValues?: Partial<FilterValues>;
}

function FilterPanel<T>({ items, config, filterFn, children, initialValues }: FilterPanelProps<T>) {
  const [defaults] = useState(() => buildDefaults(config));
  const [values, setValues] = useState<FilterValues>(() => ({ ...defaults, ...initialValues }));
  const [asyncOptions, setAsyncOptions] = useState<Record<string, { value: number; label: string; group?: string }[]>>({});

  useEffect(() => {
    config.forEach(c => {
      if (c.type === 'async-multi-select') {
        c.loadOptions().then(options => {
          setAsyncOptions(prev => ({ ...prev, [c.key]: options }));
        });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setValue = useCallback((key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const filteredItems = useMemo(
    () => items.filter(item => filterFn(item, values)),
    [items, values, filterFn]
  );

  const renderControl = (c: FilterConfig) => {
    switch (c.type) {
      case 'text':
        return (
          <TextField
            key={c.key}
            label={c.label}
            variant="outlined"
            value={values[c.key]}
            onChange={e => setValue(c.key, e.target.value)}
            sx={{ flex: 1, minWidth: 180 }}
          />
        );

      case 'multi-select':
        return (
          <MultiSelectChipFilter
            key={c.key}
            label={c.label}
            labelId={c.labelId}
            value={values[c.key]}
            onChange={v => setValue(c.key, v)}
            options={c.options}
            sx={{ flex: 1, minWidth: 200 }}
          />
        );

      case 'single-select':
        return (
          <FormControl key={c.key} sx={{ flex: 1, minWidth: 160 }}>
            <InputLabel id={c.labelId}>{c.label}</InputLabel>
            <Select
              labelId={c.labelId}
              label={c.label}
              value={values[c.key]}
              onChange={e => setValue(c.key, e.target.value)}
            >
              <MenuItem value="">{c.placeholder ?? `All ${c.label}s`}</MenuItem>
              {c.options.map(opt => (
                <MenuItem key={String(opt.value)} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'exclusive-toggle':
        return (
          <ToggleButtonGroup
            key={c.key}
            value={values[c.key]}
            exclusive
            onChange={(_, val) => val && setValue(c.key, val)}
          >
            {c.options.map(opt => (
              <ToggleButton key={opt.value} value={opt.value}>{opt.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        );

      case 'async-multi-select': {
        const loaded = asyncOptions[c.key] !== undefined;
        const options = asyncOptions[c.key] ?? [];
        const selected: number[] = values[c.key] ?? [];
        const hasGroups = options.some(o => o.group);
        const grouped = hasGroups
          ? options.reduce((acc, opt) => {
              const g = opt.group ?? '';
              acc[g] = acc[g] ?? [];
              acc[g].push(opt);
              return acc;
            }, {} as Record<string, typeof options>)
          : null;

        return (
          <FormControl key={c.key} sx={{ flex: 1, minWidth: 240 }} disabled={!loaded}>
            <InputLabel id={c.labelId}>
              {!loaded ? `${c.label} (Loading…)` : c.label}
            </InputLabel>
            <Select
              labelId={c.labelId}
              label={c.label}
              multiple
              value={selected}
              onChange={e => setValue(c.key, e.target.value as number[])}
              renderValue={sel => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(sel as number[]).map(id => {
                    const opt = options.find(o => o.value === id);
                    return opt ? <Chip size="small" key={id} label={opt.label} /> : null;
                  })}
                </Box>
              )}
            >
              {grouped
                ? Object.entries(grouped).flatMap(([group, groupItems]) => [
                    group ? <ListSubheader key={`group-${group}`}>{group}</ListSubheader> : null,
                    ...groupItems.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    )),
                  ])
                : options.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))
              }
            </Select>
          </FormControl>
        );
      }

      case 'region-tree':
        return (
          <Box key={c.key} sx={{ flex: 1, minWidth: 200 }}>
            <RegionTreePicker
              value={values[c.key] ?? null}
              onChange={v => setValue(c.key, v)}
              label={c.label}
              availableRegionIds={c.availableRegionIds}
              allowClear
              size="medium"
            />
          </Box>
        );
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
        {config.map(c => renderControl(c))}
      </Box>
      {children(filteredItems)}
    </Box>
  );
}

export default FilterPanel;
