import React, { useEffect, useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Select, InputLabel, FormControl, Button, Typography, Card, CardContent } from '@mui/material';
import { GearItem, GearItemSet, RopeItem } from '../../types/types';
import * as EquipmentDataStore from '../../helpers/EquipmentDataStore';
import { useTranslation } from 'react-i18next';
import ServiceStatusIndicator from './ServiceStatusIndicator'
import AddIcon from '@mui/icons-material/Add';

interface GearRopeSelectorProps {
  selectedRopeIds: number[];
  setSelectedRopeIds: (ids: number[]) => void;
  selectedGearIds: number[];
  setSelectedGearIds: (ids: number[]) => void;
}

export const GearRopeSelector: React.FC<GearRopeSelectorProps> = ({ selectedRopeIds, setSelectedRopeIds, selectedGearIds, setSelectedGearIds }) => {
  const [ropes, setRopes] = useState<RopeItem[]>([]);
  const [gear, setGear] = useState<GearItem[]>([]);
  const [gearSets, setGearSets] = useState<GearItemSet[]>([]);
  const { t } = useTranslation();

  const retiredGear = useMemo(() => {
    const retiredGearIds = gear?.filter(g => g.IsRetired) ?? [];
    return new Set(retiredGearIds.map(g => g.Id));
  }, [gear])

  useEffect(() => {

    Promise.all([EquipmentDataStore.load(), EquipmentDataStore.loadGearSets()])
      .then(([data, sets]) => {
        setRopes(data.ropes || []);
        setGear(data.gear || []);
        setGearSets(sets);
      })
  }, []);

  function selectGearSet(gs: GearItemSet) {
    const selectableItems = gs.Items.filter(g => !retiredGear.has(g))

    setSelectedGearIds([...new Set([...selectedGearIds, ...selectableItems])])
  }

  function getGearByCategory(gearToOrganise: GearItem[]): [key: string, values: GearItem[]][] {
    function groupBy<T extends object>(xs: T[], key: keyof T): { [key in string]: T[] } {
      return xs.reduce((rv, x) => {
        (rv[x[key]] ??= []).push(x);
        return rv;
      }, {});
    };
    return Object.entries(groupBy(gearToOrganise.filter(r => !r.IsRetired), "Category")).sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: 'base' }))
  }

  function renderGearCollection(key: string, values: GearItem[]): React.ReactNode {

    return <Box key={key}>

      <Typography mb={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        {key}

      </Typography>
      <Box display={'flex'} gap={1} flexWrap={'wrap'} ml={1}>
        {values.sort((a, b) => a.Name.localeCompare(b.Name)).map(v => {
          const isSelected = selectedGearIds.includes(v.Id);
          return <Chip
            size='small'
            key={v.Id}
            label={v.Name}
            variant={isSelected ? 'filled' : 'outlined'}
            color={isSelected ? 'info' : 'primary'}
            onClick={() => !isSelected
              ? setSelectedGearIds([...selectedGearIds, v.Id])
              : setSelectedGearIds([...selectedGearIds].filter(s => s !== v.Id))}
          />
        })}
      </Box>
    </Box>

  }


  return (
    <>
      <Typography variant='h6'>{t('common:terms.rope.upper', { count: 2 })}</Typography>
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
          {ropes.filter(r => !r.IsRetired).map((rope) => (
            <MenuItem key={rope.Id} value={rope.Id}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <ServiceStatusIndicator isRetired={rope.IsRetired} statusCode={rope.LatestStatusCode} />
                <span>{rope.Name} - {rope.Length} {rope.Unit}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 240, flex: 1, gap: 1 }}>
        <Typography variant='h6'>{t('common:terms.gear.upper', { count: 2 })}</Typography>
        <Box display={'flex'} gap={1} flexWrap={'wrap'} alignItems={'center'}>

          <Chip
            label={'All Gear'}
            deleteIcon={<AddIcon />}
            color='primary'
            onDelete={() => setSelectedGearIds(gear.filter(g => !g.IsRetired).map(s => s.Id))}
            onClick={() => setSelectedGearIds(gear.filter(g => !g.IsRetired).map(s => s.Id))}
          />
          {gearSets.map(gs => {
            return <Chip
              key={gs.Id}
              label={gs.Name}
              deleteIcon={<AddIcon />}
              color='primary'
              variant='outlined'
              onDelete={() => selectGearSet(gs)}
              onClick={() => selectGearSet(gs)}
            />
          })}
          <Button variant='text' size='small' onClick={() => setSelectedGearIds([])}>{t('common:actions.clear')}</Button>

        </Box>
        <Card sx={{ borderLeft: 2, ml: 1, mt: 1, borderColor: 'secondary.main' }}>
          <CardContent>
            {gear.length > 0 ? <Box display={'flex'} gap={1} flexWrap={'wrap'} flexDirection={'column'}>
              {getGearByCategory(gear).map(([key, values]) => {
                return renderGearCollection(key, values)
              })}</Box> : <Box display={'flex'} justifyContent={'center'} alignItems={'center'} minHeight={100}><Typography variant='subtitle2'>{t('translation:record.noGear')}</Typography></Box>}
          </CardContent>
        </Card>

      </FormControl >
    </>
  );
};

