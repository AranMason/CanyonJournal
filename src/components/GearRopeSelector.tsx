import React, { useEffect, useState } from 'react';
import { Box, Chip, MenuItem, Select, InputLabel, FormControl, ListSubheader } from '@mui/material';
import axios from 'axios';
import { GearItem, RopeItem } from '../types/types';

interface GearRopeSelectorProps {
  selectedRopeIds: number[];
  setSelectedRopeIds: (ids: number[]) => void;
  selectedGearIds: number[];
  setSelectedGearIds: (ids: number[]) => void;
}

export const GearRopeSelector: React.FC<GearRopeSelectorProps> = ({ selectedRopeIds, setSelectedRopeIds, selectedGearIds, setSelectedGearIds }) => {
  const [ropes, setRopes] = useState<RopeItem[]>([]);
  const [gear, setGear] = useState<GearItem[]>([]);

  useEffect(() => {
    axios.get('/api/equipment').then(res => {
      setRopes(res.data.ropes || []);
      setGear(res.data.gear || []);
    });
  }, []);

  return (
    <Box sx={{ mt: 3, mb: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="rope-select-label">Select Ropes</InputLabel>
        <Select
          labelId="rope-select-label"
          label="Select Ropes"
          multiple
          value={selectedRopeIds || []}
          onChange={e => setSelectedRopeIds(e.target.value as number[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as number[]).map((id) => {
                const rope = ropes.find(r => r.Id === id);
                return rope ? <Chip key={id} label={rope.Name} /> : null;
              })}
            </Box>
          )}
        >
          {ropes.map((rope) => (
            <MenuItem key={rope.Id} value={rope.Id}>{rope.Name} - {rope.Length} {rope.Unit}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="gear-select-label">Select Gear</InputLabel>
        <Select
          labelId="gear-select-label"
          label="Select Gear"
          multiple
          value={selectedGearIds || []}
          onChange={e => setSelectedGearIds(e.target.value as number[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as number[]).map((id) => {
                const g = gear.find(gg => gg.Id === id);
                return g ? <Chip key={id} label={g.Name} /> : null;
              })}
            </Box>
          )}
        >
          {Object.entries(
            gear.reduce((acc, g) => {
              acc[g.Category] = acc[g.Category] || [];
              acc[g.Category].push(g);
              return acc;
            }, {} as Record<string, GearItem[]>)
          ).map(([category, items]) => [
            <ListSubheader key={category}>{category}</ListSubheader>,
            items.map(g => (
              <MenuItem key={g.Id} value={g.Id}>{g.Name}</MenuItem>
            ))
          ])}
        </Select>
      </FormControl>
    </Box>
  );
};
