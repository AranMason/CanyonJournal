import React from 'react';
import { Box, Chip, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface Option<T> {
  value: T;
  label: string;
}

interface MultiSelectChipFilterProps<T extends string | number> {
  label: string;
  labelId: string;
  value: T[];
  onChange: (value: T[]) => void;
  options: Option<T>[];
  sx?: object;
}

function MultiSelectChipFilter<T extends string | number>({
  label,
  labelId,
  value,
  onChange,
  options,
  sx,
}: MultiSelectChipFilterProps<T>) {
  return (
    <FormControl fullWidth sx={sx}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        multiple
        labelId={labelId}
        label={label}
        value={value}
        onChange={e => onChange(e.target.value as T[])}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as T[]).map(v => {
              const opt = options.find(o => o.value === v);
              return <Chip size="small" key={String(v)} label={opt?.label ?? String(v)} />;
            })}
          </Box>
        )}
      >
        {options.map(opt => (
          <MenuItem key={String(opt.value)} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default MultiSelectChipFilter;
