import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Chip, TextField } from '@mui/material';
import { apiFetch } from '../utils/api';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate } from 'react-router-dom';
import { CanyonRecord } from '../types/CanyonRecord';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import { Canyon } from '../types/Canyon';
import { loadById } from '../heleprs/CanyonDataStore';
import RegionType, { RegionTypeList } from '../types/RegionEnum';
import { GetRegionDisplayName } from '../heleprs/EnumMapper';
import { GearRopeSelector } from '../components/GearRopeSelector';
import EditNoteIcon from '@mui/icons-material/EditNote';

type CanyonDict = { [n: number]: Canyon };

const RecordsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: loadingUser } = useUser();
  const [records, setRecords] = useState<CanyonRecord[]>([]);
  const [canyonsById, setCanyonsById] = useState<CanyonDict>({});
  const [filteredRecords, setFilteredRecords] = useState<CanyonRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);
  // Filters
  const [nameFilter, setNameFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<RegionType[]>([]);
  const [selectedGearIds, setSelectedGearIds] = useState<number[]>([]);
  const [selectedRopeIds, setSelectedRopeIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true)

      const [data, canyons] = await Promise.all([
        apiFetch<{ records: CanyonRecord[] }>('/api/record'),
        loadById()
      ])
      setRecords(data.records || []);

      setCanyonsById(canyons);

      setIsLoading(false);
    };

    if (user && (!isLoading || !loadingUser)) {
      fetchRecords();
    } else {
      setRecords([]);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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
        if (!canyon) return false;
        return regionFilter.includes(canyon.Region ?? RegionType.Unknown);
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

    if (!id || sectionOpen === id) {
      setSectionOpen(null);
    } else {
      setSectionOpen(id);
    }
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
            <FormControl sx={{ minWidth: 240, flex: 1 }}>
              <InputLabel id="record-region-label">Region</InputLabel>
              <Select
                multiple
                labelId="record-region-label"
                label="Region"
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value as RegionType[])}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as RegionType[]).map((region) => (
                      <Chip size="small" key={region} label={GetRegionDisplayName(region)} />
                    ))}
                  </Box>
                )}
              >
                {RegionTypeList.map((region) => (
                  <MenuItem key={region} value={region}>{GetRegionDisplayName(region)}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
              canyon={rec.CanyonId ? canyonsById[rec.CanyonId] : undefined} />
          ))
        )}
      </Box>
    </PageTemplate>
  );
};

export default RecordsOverviewPage;
