import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  DialogContent,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { Region } from '../types/Region';
import * as RegionDataStore from '../helpers/RegionDataStore';
import { useTranslation } from 'react-i18next';
import RegionTreeView from './RegionTreeView';
import AppModal from './AppModal';

interface RegionTreePickerProps {
  value: number | null;
  onChange: (id: number | null) => void;
  label?: string;
  placeholder?: string;
  allowClear?: boolean;
  error?: boolean;
  helperText?: string;
  size?: 'small' | 'medium';
  /** When provided, prunes the tree to only regions the user has data in (and their ancestors). */
  availableRegionIds?: number[];
}

const RegionTreePicker: React.FC<RegionTreePickerProps> = ({
  value,
  onChange,
  label,
  placeholder,
  allowClear = true,
  error,
  helperText,
  size = 'small',
  availableRegionIds,
}) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [tree, setTree] = useState<Region[]>([]);
  const [flat, setFlat] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);

  const resolvedLabel = label ?? t('fields.region');
  const resolvedPlaceholder = placeholder ?? t('fields.anyRegion', 'Any region');

  // Load region tree on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([RegionDataStore.loadTree(), RegionDataStore.load()])
      .then(([treeData, flatData]) => {
        setTree(treeData);
        setFlat(flatData);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedRegion = useMemo(() => flat.find(r => r.Id === value) ?? null, [flat, value]);
  const displayValue: string = getDisplayValue(selectedRegion)

  function getDisplayValue(region: Region | null): string {

    if(!region) return '';

    return region.Name;
  }

  const visibleTree = useMemo(() => {
    if (!availableRegionIds) return tree;
    const available = new Set(availableRegionIds);
    return elevateTree(pruneTree(tree, available), available);
  }, [tree, availableRegionIds]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  // Expand all parent nodes of the currently selected value;
  // if the visible tree is small, expand everything for convenience.
  const expandedIds = useMemo(() => {
    const allVisibleIds = collectAllIds(visibleTree);
    if (allVisibleIds.length < 10) return allVisibleIds;
    return value != null ? getAncestorIds(value, flat).map(String) : [];
  }, [visibleTree, value, flat]);

  return (
    <>
      <FormControl fullWidth error={error} size={size} onClick={() => setOpen(true)} sx={{ cursor: 'pointer' }}>
        <InputLabel shrink={!!selectedRegion || open}>{resolvedLabel}</InputLabel>
        <OutlinedInput
          readOnly
          size={size}
          notched={!!selectedRegion || open}
          label={resolvedLabel}
          value={displayValue}
          inputProps={{ placeholder: resolvedPlaceholder }}
          sx={{ cursor: 'pointer', '& input': { cursor: 'pointer' } }}
          endAdornment={
            loading ? (
              <CircularProgress size={16} />
            ) : allowClear && value != null ? (
              <IconButton size="small" onClick={handleClear} tabIndex={-1}>
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null
          }
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>

      <AppModal open={open} onClose={() => setOpen(false)} title={resolvedLabel} maxWidth="xs">
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <RegionTreeView
              nodes={visibleTree}
              selectedId={value}
              expandedIds={expandedIds}
              onSelect={id => { onChange(id); setOpen(false); }}
              sx={{ maxHeight: 400, overflowY: 'auto' }}
            />
          )}
          {allowClear && value != null && (
            <Button onClick={() => { onChange(null); setOpen(false); }} size="small" sx={{ mt: 1 }}>
              {t('actions.clear', 'Clear')}
            </Button>
          )}
        </DialogContent>
      </AppModal>
    </>
  );
};

function getAncestorIds(regionId: number | null, flat: Region[]): number[] {
  if (regionId == null) return [];
  const parentMap = new Map(flat.map(r => [r.Id, r.ParentId]));
  const ancestors: number[] = [];
  let current = parentMap.get(regionId);
  while (current != null) {
    ancestors.push(current);
    current = parentMap.get(current) ?? null;
  }
  return ancestors;
}

function collectAllIds(nodes: Region[]): string[] {
  return nodes.flatMap(n => [String(n.Id), ...collectAllIds(n.Children ?? [])]);
}

/** Prune the tree to only nodes whose subtree contains at least one available ID. */
function pruneTree(nodes: Region[], available: Set<number>): Region[] {
  return nodes.reduce<Region[]>((acc, node) => {
    const prunedChildren = pruneTree(node.Children ?? [], available);
    if (available.has(node.Id) || prunedChildren.length > 0) {
      acc.push({ ...node, Children: prunedChildren });
    }
    return acc;
  }, []);
}

/**
 * Returns a reference to the highest subtree root where the useful data begins,
 * by skipping single grouping-only ancestors (those with no direct canyons).
 * Note: returns a reference into the pruned tree, not a copy.
 */
function elevateTree(nodes: Region[], available: Set<number>): Region[] {
  while (nodes.length === 1) {
    const node = nodes[0];
    if (available.has(node.Id) || !node.Children?.length) break;
    nodes = node.Children;
  }
  return nodes;
}

export default RegionTreePicker;
