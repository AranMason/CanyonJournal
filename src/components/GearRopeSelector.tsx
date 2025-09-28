import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';

interface GearRopeSelectorProps {
  selectedRopeIds: number[];
  setSelectedRopeIds: (ids: number[]) => void;
  selectedGearIds: number[];
  setSelectedGearIds: (ids: number[]) => void;
}

export const GearRopeSelector: React.FC<GearRopeSelectorProps> = ({ selectedRopeIds, setSelectedRopeIds, selectedGearIds, setSelectedGearIds }) => {
  const [ropes, setRopes] = useState<any[]>([]);
  const [gear, setGear] = useState<any[]>([]);

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
          value={selectedRopeIds}
          onChange={e => setSelectedRopeIds(e.target.value as number[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as number[]).map((id) => {
                const rope = ropes.find(r => r.id === id);
                return rope ? <Chip key={id} label={rope.name} /> : null;
              })}
            </Box>
          )}
        >
          {ropes.map((rope) => (
            <MenuItem key={rope.id} value={rope.id}>{rope.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="gear-select-label">Select Gear</InputLabel>
        <Select
          labelId="gear-select-label"
          label="Select Gear"
          multiple
          value={selectedGearIds}
          onChange={e => setSelectedGearIds(e.target.value as number[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as number[]).map((id) => {
                const g = gear.find(gg => gg.id === id);
                return g ? <Chip key={id} label={g.name} /> : null;
              })}
            </Box>
          )}
        >
          {gear.map((g) => (
            <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
