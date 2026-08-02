import React, { useEffect, useState } from 'react';
import { Box, Chip, MenuItem, Select, InputLabel, FormControl, ListSubheader, Button, DialogContent, DialogActions, ListItem, List, Checkbox } from '@mui/material';
import { GearItem, GearItemSet, RopeItem } from '../../types/types';
import * as EquipmentDataStore from '../../helpers/EquipmentDataStore';
import { useTranslation } from 'react-i18next';
import ServiceStatusIndicator from './ServiceStatusIndicator';
import AppModal from '../AppModal';

interface GearRopeSelectorProps {
  selectedRopeIds: number[];
  setSelectedRopeIds: (ids: number[]) => void;
  selectedGearIds: number[];
  setSelectedGearIds: (ids: number[]) => void;
}

export const GearRopeSelector: React.FC<GearRopeSelectorProps> = ({ selectedRopeIds, setSelectedRopeIds, selectedGearIds, setSelectedGearIds }) => {
  const [isGearSetOpen, setIsGearSetOpen] = useState(false);
  const [ropes, setRopes] = useState<RopeItem[]>([]);
  const [gear, setGear] = useState<GearItem[]>([]);
  const [gearSets, setGearSets] = useState<GearItemSet[]>([]);
  const [selectedGearSets, setSelectedGearSets] = useState<GearItemSet[]>([]);
  const { t } = useTranslation();

  useEffect(() => {

    Promise.all([EquipmentDataStore.load(), EquipmentDataStore.loadGearSets()])
      .then(([data, sets]) => {
        setRopes(data.ropes || []);
        setGear(data.gear || []);
        setGearSets(sets);
      })
  }, []);

  return (
    <>
      <FormControl sx={{ minWidth: 240, flex: 1 }}>
        <InputLabel id="rope-select-label">{t('common:terms.rope.upper', { count: 2 })}</InputLabel>
        <Select
          labelId="rope-select-label"
          label={t('common:terms.rope.upper', { count: 2 })}
          multiple
          value={selectedRopeIds || []}
          onChange={e => setSelectedRopeIds(e.target.value as number[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as number[]).map((id) => {
                const rope = ropes.find(r => r.Id === id);
                return rope ? (
                  <Chip
                    size="small"
                    key={id}
                    label={(
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <ServiceStatusIndicator isRetired={rope.IsRetired} statusCode={rope.LatestStatusCode} />
                        <span>{rope.Name}</span>
                      </Box>
                    )}
                  />
                ) : null;
              })}
            </Box>
          )}
        >
          {ropes.map((rope) => (
            <MenuItem key={rope.Id} value={rope.Id}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <ServiceStatusIndicator isRetired={rope.IsRetired} statusCode={rope.LatestStatusCode} />
                <span>{rope.Name} - {rope.Length} {rope.Unit}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 240, flex: 1 }}>
        <InputLabel id="gear-select-label">{t('common:terms.gear.upper', { count: 1 })}</InputLabel>
        <Select
          labelId="gear-select-label"
          label={t('common:terms.gear.upper', { count: 1 })}
          multiple
          value={selectedGearIds || []}
          onChange={e => setSelectedGearIds(e.target.value as number[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as number[]).map((id) => {
                const g = gear.find(gg => gg.Id === id);
                return g ? (
                  <Chip
                    size="small"
                    key={id}
                    label={(
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <ServiceStatusIndicator isRetired={g.IsRetired} statusCode={g.LatestStatusCode} />
                        <span>{g.Name}</span>
                      </Box>
                    )}
                  />
                ) : null;
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
              <MenuItem key={g.Id} value={g.Id}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                  <ServiceStatusIndicator isRetired={g.IsRetired} statusCode={g.LatestStatusCode} />
                  <span>{g.Name}</span>
                </Box>
              </MenuItem>
            ))
          ])}
        </Select>
      </FormControl>
      {gearSets && <>
        <AppModal open={isGearSetOpen} onClose={() => setIsGearSetOpen(false)} title={t('translation:gear.gearSet.modalTitle_select')}>
          <DialogContent>
            <List>
              {gearSets.map(s => {
                const isChecked = selectedGearSets.includes(s)

                return <ListItem key={s.Id} secondaryAction={<Checkbox onClick={() => {
                  if (isChecked) {
                    const newChecked = selectedGearSets.filter(f => f.Id !== s.Id);
                    setSelectedGearSets(newChecked);
                  } else {
                    setSelectedGearSets([...selectedGearSets, s])
                  }
                }} checked={isChecked} />}>{s.Name}</ListItem>
              })}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsGearSetOpen(false)}>{t('common:actions.close')}</Button>
            <Button variant='contained' onClick={() => {
              const gearIdsFromSets = selectedGearSets.flatMap(s => s.Items);
              // Remove Duplicates
              const newList = [...new Set([...selectedGearIds, ...gearIdsFromSets])];
              setSelectedGearIds(newList);
              setIsGearSetOpen(false);
              setSelectedGearSets([]);
            }}>{t('common:actions.add')}</Button>
          </DialogActions>
        </AppModal>
        <Button variant='outlined' disabled={!gearSets?.length} onClick={() => setIsGearSetOpen(true)}>{t('translation:record.selectGearSetBtn')}</Button>
      </>}
    </>
  );
};

