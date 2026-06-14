import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Collapse } from '@mui/material';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CanyonRecord } from '../types/CanyonRecord';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import CreateIcon from '@mui/icons-material/Create';
import { useCanyonRecords } from '../hooks/useCanyonRecords';
import FilterPanel, { FilterValues } from '../components/FilterPanel';
import {
  getCanyonNameFilterConfig, getRegionFilterConfig,
  getRopeFilterConfig, getGearFilterConfig, getTagFilterConfig,
} from '../helpers/filterConfigs';
import * as RegionDataStore from '../helpers/RegionDataStore';
import { Region } from '../types/Region';
import ReportCTAAlert from '../components/ReportCTAAlert';
import { useTranslation } from 'react-i18next';

const RecordsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user, loading: loadingUser } = useUser();
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);
  const [flatRegions, setFlatRegions] = useState<Region[]>([]);

  const { records, canyonsById, userCanyonsById, isLoading } = useCanyonRecords(
    '/api/record',
    !loadingUser && Boolean(user)
  );

  useEffect(() => {
    RegionDataStore.load().then(setFlatRegions);
  }, []);

  const usedRegionIds = useMemo(() => {
    const ids = records.map(rec => {
      const canyon = rec.CanyonId ? canyonsById[rec.CanyonId] : undefined;
      const userCanyon = rec.UserCanyonId ? userCanyonsById[rec.UserCanyonId] : undefined;
      return canyon?.RegionId ?? userCanyon?.RegionId ?? rec.RegionId ?? null;
    });
    return [...new Set(ids.filter((id): id is number => id != null))];
  }, [records, canyonsById, userCanyonsById]);

  const filterConfig = useMemo(() => [
    getCanyonNameFilterConfig(),
    getRegionFilterConfig('region', usedRegionIds),
    getRopeFilterConfig(),
    getGearFilterConfig(),
    getTagFilterConfig(),
  ], [usedRegionIds]);

  const filterFn = useCallback((rec: CanyonRecord, values: FilterValues) => {
    const canyon = rec.CanyonId ? canyonsById[rec.CanyonId] : undefined;
    const userCanyon = rec.UserCanyonId ? userCanyonsById[rec.UserCanyonId] : undefined;
    const canyonName = canyon?.Name ?? userCanyon?.Name ?? rec.Name ?? '';
    const regionId = canyon?.RegionId ?? userCanyon?.RegionId ?? rec.RegionId ?? null;

    const nf = (values.name as string).trim().toLowerCase();
    if (nf && !canyonName.toLowerCase().includes(nf)) return false;

    if (values.region != null) {
      if (regionId == null) return false;
      const ids = RegionDataStore.getDescendantIds(values.region as number, flatRegions);
      if (!ids.includes(regionId)) return false;
    }

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
  }, [canyonsById, userCanyonsById, flatRegions]);

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

  const reportCanyonId = searchParams.get('reportCanyonId');
  const reportCanyon = reportCanyonId ? canyonsById[Number(reportCanyonId)] : undefined;
  const [reportAlertOpen, setReportAlertOpen] = useState(Boolean(reportCanyonId));

  return (
    <PageTemplate pageTitle={t('journal.title')} isAuthRequired isLoading={isLoading}>
      <Collapse in={reportAlertOpen && Boolean(reportCanyon)}>
        {reportCanyon && (
          <ReportCTAAlert canyon={reportCanyon} onClose={() => setReportAlertOpen(false)} />
        )}
      </Collapse>
      <Box>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="tertiary"
            onClick={() => navigate("/journal/record")}
            startIcon={<CreateIcon />}>
              {t('common:actions.recordDescent')}
          </Button>
        </Box>
        <FilterPanel<CanyonRecord>
          items={records}
          config={filterConfig}
          filterFn={filterFn}
          initialValues={initialValues}
        >
          {(filteredRecords) => filteredRecords.length === 0 ? (
            <div>{t('journal.noRecords')}</div>
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


