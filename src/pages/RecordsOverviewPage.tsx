import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CanyonRecord } from '../types/CanyonRecord';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useCanyonRecords } from '../hooks/useCanyonRecords';
import FilterPanel, { FilterValues } from '../components/FilterPanel';
import {
  getCanyonNameFilterConfig, getRegionFilterConfig,
  getRopeFilterConfig, getGearFilterConfig, getTagFilterConfig,
} from '../helpers/filterConfigs';

const RecordsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: loadingUser } = useUser();
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);

  const { records, canyonsById, userCanyonsById, isLoading } = useCanyonRecords(
    '/api/record',
    !loadingUser && Boolean(user)
  );

  const filterConfig = useMemo(() => [
    getCanyonNameFilterConfig(),
    getRegionFilterConfig(),
    getRopeFilterConfig(),
    getGearFilterConfig(),
    getTagFilterConfig(),
  ], []);

  const filterFn = useCallback((rec: CanyonRecord, values: FilterValues) => {
    const canyon = rec.CanyonId ? canyonsById[rec.CanyonId] : undefined;
    const userCanyon = rec.UserCanyonId ? userCanyonsById[rec.UserCanyonId] : undefined;
    const canyonName = canyon?.Name ?? userCanyon?.Name ?? rec.Name ?? '';
    const region = canyon?.Region ?? userCanyon?.Region ?? rec.Region;

    const nf = (values.name as string).trim().toLowerCase();
    if (nf && !canyonName.toLowerCase().includes(nf)) return false;

    if (values.region !== '' && region !== values.region) return false;

    const gearFilter = values.gear as number[];
    if (gearFilter.length > 0) {
      if (!rec.GearIds || !gearFilter.every(x => rec.GearIds.includes(x))) return false;
    }

    const ropeFilter = values.ropes as number[];
    if (ropeFilter.length > 0) {
      if (!rec.RopeIds || !ropeFilter.every(x => rec.RopeIds.includes(x))) return false;
    }

    const tagFilter = values.tags as number[];
    if (tagFilter.length > 0) {
      const recTagIds = rec.Tags?.map(t => t.Id) ?? [];
      if (!tagFilter.every(x => recTagIds.includes(x))) return false;
    }

    return true;
  }, [canyonsById, userCanyonsById]);

  const initialValues = useMemo(() => {
    const gearId = searchParams.get('gearId');
    const ropeId = searchParams.get('ropeId');
    const init: Partial<FilterValues> = {};
    if (gearId) init.gear = [Number(gearId)];
    if (ropeId) init.ropes = [Number(ropeId)];
    return init;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAccordionToggle(id: number | null) {
    setSectionOpen(prev => prev === id ? null : id);
  }

  return (
    <PageTemplate pageTitle="Your Journal" isAuthRequired isLoading={isLoading}>
      <Box>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/journal/record")}
            startIcon={<EditNoteIcon />}>
              Record Descent
          </Button>
        </Box>
        <FilterPanel<CanyonRecord>
          items={records}
          config={filterConfig}
          filterFn={filterFn}
          initialValues={initialValues}
        >
          {(filteredRecords) => filteredRecords.length === 0 ? (
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
        </FilterPanel>
      </Box>
    </PageTemplate>
  );
};

export default RecordsOverviewPage;
