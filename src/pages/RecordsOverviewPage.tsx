import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CanyonRecord } from '../types/CanyonRecord';
import { Canyon } from '../types/Canyon';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import RegionType, { RegionTypeList } from '../types/RegionEnum';
import { GetRegionDisplayName } from '../helpers/EnumMapper';
import { GearRopeSelector } from '../components/GearRopeSelector';
import EditNoteIcon from '@mui/icons-material/EditNote';
import MultiSelectChipFilter from '../components/MultiSelectChipFilter';
import { useCanyonRecords } from '../hooks/useCanyonRecords';

const RecordsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: loadingUser } = useUser();
  const [filteredRecords, setFilteredRecords] = useState<CanyonRecord[]>([]);
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);
  // Filters
  const [nameFilter, setNameFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<RegionType[]>([]);
  const [selectedGearIds, setSelectedGearIds] = useState<number[]>(() => {
    const id = searchParams.get('gearId');
    return id ? [Number(id)] : [];
  });
  const [selectedRopeIds, setSelectedRopeIds] = useState<number[]>(() => {
    const id = searchParams.get('ropeId');
    return id ? [Number(id)] : [];
  });

  const { records, canyonsById, userCanyonsById, isLoading } = useCanyonRecords(
    '/api/record',
    !loadingUser && Boolean(user)
  );

  // Derive available regions from actual records (only regions the user has descended in)
  const availableRegions = useMemo(() => {
    const regionSet = new Set(
      records
        .map(rec => {
          const canyon = rec.CanyonId ? canyonsById[rec.CanyonId] : undefined;
          return canyon?.Region ?? rec.Region;
        })
        .filter((r): r is RegionType => r !== null && r !== undefined)
    );
    return RegionTypeList.filter(r => regionSet.has(r));
  }, [records, canyonsById]);

  // Apply filters when records, canyons or filter options change
  useEffect(() => {
    const applyFilters = () => {
      if (!records || records.length === 0) {
        setFilteredRecords([]);
        return;
      }

      const nf = nameFilter.trim().toLowerCase();

      const matchesName = (rec: CanyonRecord, canyon?: Canyon) => {
        if (!nf) return true;
        const canyonName = canyon?.Name || rec.Name || '';
        return canyonName.toLowerCase().includes(nf);
      };

      const matchesRegion = (rec: CanyonRecord, canyon?: Canyon) => {
        if (!regionFilter || regionFilter.length === 0) return true;
        // Prefer the linked canyon's region; fall back to the record's own region field
        // null/undefined means region was never set — don't conflate with Unknown (0)
        const region = canyon?.Region ?? rec.Region;
        if (region === null || region === undefined) return false;
        return regionFilter.includes(region);
      };

      const intersects = (gearUsed: number[] | undefined, gearFilteredBy: number[]) => {
        if (!gearFilteredBy || gearFilteredBy.length === 0) return true; // no filter
        if (!gearUsed || gearUsed.length === 0) return false;
        return gearFilteredBy.every(x => gearUsed.includes(x));
      };

      const newList = records.filter(rec => {
        const canyon = rec.CanyonId ? canyonsById[rec.CanyonId] : undefined;
        if (!matchesName(rec, canyon)) return false;
        if (!matchesRegion(rec, canyon)) return false;
        if (!intersects(rec.GearIds, selectedGearIds)) return false;
        if (!intersects(rec.RopeIds, selectedRopeIds)) return false;
        return true;
      });

      setFilteredRecords(newList);
    };

    applyFilters();
  }, [records, canyonsById, nameFilter, regionFilter, selectedGearIds, selectedRopeIds]);

  function handleAccordionToggle(id: number | null) {
    setSectionOpen(prev => prev === id ? null : id);
  }


  return (
    <PageTemplate pageTitle="Your Journal" isAuthRequired isLoading={isLoading}>
      <Box>
        <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate("/journal/record")} 
            startIcon={<EditNoteIcon />}>
              Record Descent
          </Button>
          <Button type="button" variant="outlined" onClick={() => {
              setNameFilter('');
              setRegionFilter([]);
              setSelectedGearIds([]);
              setSelectedRopeIds([]);
            }}>Clear Filters</Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Canyon Name"
              variant="outlined"
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
              sx={{ flex: 1 }}
            />
            <MultiSelectChipFilter<RegionType>
              label="Region"
              labelId="record-region-label"
              value={regionFilter}
              onChange={setRegionFilter}
              options={availableRegions.map(r => ({ value: r, label: GetRegionDisplayName(r) }))}
              sx={{ minWidth: 240, flex: 1 }}
            />
          </Box>
          <Box display="flex" gap={2} flexDirection="row">
            <GearRopeSelector
              selectedRopeIds={selectedRopeIds}
              setSelectedRopeIds={setSelectedRopeIds}
              selectedGearIds={selectedGearIds}
              setSelectedGearIds={setSelectedGearIds}
            />
          </Box>
        </Box>
        {filteredRecords.length === 0 ? (
          <div>No Records</div>
        ) : (
          filteredRecords.map(rec => (
            <CanyonRecordAccordion
              key={rec.Id ?? rec.Timestamp ?? `${rec.Name}-${rec.Date}`}
              isOpen={sectionOpen === rec.Id}
              onChange={() => handleAccordionToggle(rec.Id ?? null)}
              record={rec}
              canyon={rec.CanyonId ? canyonsById[rec.CanyonId] : rec.UserCanyonId ? userCanyonsById[rec.UserCanyonId] : undefined} />
          ))
        )}
      </Box>
    </PageTemplate>
  );
};

export default RecordsOverviewPage;
