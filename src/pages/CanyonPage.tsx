import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CanyonRating from '../components/CanyonRating';
import { apiFetch } from '../utils/api';
import { CanyonListEntry } from '../types/Canyon';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { GetRegionDisplayName } from '../helpers/EnumMapper';
import FilterPanel, { FilterValues } from '../components/FilterPanel';
import DateTableCell from '../components/table/DateTableCell';
import CanyonNameTableCell from '../components/table/CanyonNameCell';
import CanyonTypeTableCell from '../components/table/CanyonTypeCell';
import { CanyonTypeEnum } from '../types/CanyonTypeEnum';
import {
  getRegionFilterConfig, getCanyonTypeFilterConfig,
  getVerticalRatingFilterConfig, getAquaticRatingFilterConfig, getStarRatingFilterConfig,
  getCanyonNameFilterConfig
} from '../helpers/filterConfigs';
import * as RegionDataStore from '../helpers/RegionDataStore';
import { Region } from '../types/Region';
import { useTranslation } from 'react-i18next';

const minDateString: string = '1900-01-01' 

enum SortOptionEnum {
  TotalDescents = 1,
  Name = 2,
  LastDescent = 3,
  VerticalRating = 4,
  AquaticRating = 5,
  CommitmentRating = 6,
  StarRating = 7
}

const SortParams: { [key in SortOptionEnum]: {
  option: key,
  displayName: string,
  method: (a: CanyonListEntry, b: CanyonListEntry) => number,
} } = {
  [SortOptionEnum.TotalDescents]: {
    option: SortOptionEnum.TotalDescents,
    displayName: 'Descents',
    method: (a, b) => b.Descents - a.Descents
  },
  [SortOptionEnum.Name]: {
    option: SortOptionEnum.Name,
    displayName: 'Name',
    method: (a, b) => a.Name.localeCompare(b.Name)
  },
  [SortOptionEnum.LastDescent]: {
    option: SortOptionEnum.LastDescent,
    displayName: 'Last Descent',
    method: (a, b) => {
      // A little bit hacky, tbh we should probably parse the Date object first, so we are not doing a pile of repeat work
      return Date.parse(b.LastDescentDate ?? minDateString) - Date.parse(a.LastDescentDate ?? minDateString);
    }
  },
  [SortOptionEnum.VerticalRating]: {
    option: SortOptionEnum.VerticalRating,
    displayName: 'Vertical',
    method: (a, b) => (b.IsUnrated ? -1 : b.VerticalRating) - (a.IsUnrated ? -1 : a.VerticalRating)
  },
  [SortOptionEnum.AquaticRating]: {
    option: SortOptionEnum.AquaticRating,
    displayName: 'Aquatic',
    method: (a, b) => (b.IsUnrated ? -1 : b.AquaticRating) - (a.IsUnrated ? -1 : a.AquaticRating)
  },
  [SortOptionEnum.CommitmentRating]: {
    option: SortOptionEnum.CommitmentRating,
    displayName: 'Commitment',
    method: (a, b) => (b.IsUnrated ? -1 : b.CommitmentRating) - (a.IsUnrated ? -1 : a.CommitmentRating)
  },
  [SortOptionEnum.StarRating]: {
    option: SortOptionEnum.StarRating,
    displayName: 'Star',
    method: (a, b) => (b.IsUnrated ? -1 : b.StarRating) - (a.IsUnrated ? -1 : a.StarRating)
  }
}

const CanyonList: React.FC = () => {
  const { user, loading } = useUser();
  const { t } = useTranslation();
  const [canyons, setCanyons] = useState<CanyonListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState<SortOptionEnum>(SortOptionEnum.TotalDescents);
  const [flatRegions, setFlatRegions] = useState<Region[]>([]);

  const refresh = () => {
    setIsLoading(true);
    apiFetch<CanyonListEntry[]>('/api/canyons?withDescents=1')
      .then(setCanyons)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!loading && user) {
      refresh();
      RegionDataStore.load().then(setFlatRegions);
    }
  }, [user, loading]);

  const usedRegionIds = useMemo(
    () => [...new Set(canyons.map(c => c.RegionId).filter((id): id is number => id != null))],
    [canyons]
  );

  const filterConfig = useMemo(() => [
    getCanyonNameFilterConfig(),
    getRegionFilterConfig('region', usedRegionIds),
    getCanyonTypeFilterConfig(),
    getVerticalRatingFilterConfig(),
    getAquaticRatingFilterConfig(),
    getStarRatingFilterConfig(),
  ], [usedRegionIds]);

  const filterFn = useCallback((canyon: CanyonListEntry, values: FilterValues) => {
    if (values.region != null && canyon.RegionId != null) {
      const ids = RegionDataStore.getDescendantIds(values.region as number, flatRegions);
      if (!ids.includes(canyon.RegionId)) return false;
    } else if (values.region != null && canyon.RegionId == null) {
      return false;
    }

    const typeFilter = values.type as CanyonTypeEnum[];
    if (typeFilter.length > 0) {
      if (canyon.CanyonType === null || canyon.CanyonType === undefined) return false;
      if (!typeFilter.includes(canyon.CanyonType)) return false;
    }

    const vertFilter = values.verticalRating as number[];
    const aquaFilter = values.aquaRating as number[];
    const starFilter = values.starRating as number[];

    if (vertFilter.length > 0 || aquaFilter.length > 0 || starFilter.length > 0) {
      if (canyon.IsUnrated) return false;
    }
    if (vertFilter.length > 0 && !vertFilter.includes(canyon.VerticalRating ?? 0)) return false;
    if (aquaFilter.length > 0 && !aquaFilter.includes(canyon.AquaticRating ?? 0)) return false;
    if (starFilter.length > 0 && !starFilter.includes(canyon.StarRating ?? 0)) return false;

    return true;
  }, [flatRegions]);

  function getSortedCanyons(filteredCanyons: CanyonListEntry[]): CanyonListEntry[] {

    return [...filteredCanyons].sort((a, b) => {
      var diffVal = SortParams[sort].method(a, b);

      if(diffVal === 0) {
        return SortParams[SortOptionEnum.Name].method(a, b);
      }

      return diffVal
    })
  }

  return (
    <PageTemplate pageTitle={t('nav.canyons')} isAuthRequired isLoading={isLoading}>
      <Alert
        severity="info"
        sx={{
          mb: 2, mt: 1, py: 2,
          alignItems: 'center',
          '& .MuiAlert-icon': { mr: 2 },
        }}
        icon={<img src="/images/canyonlog/icon.png" alt={t('common:partners.canyonLog')} style={{ height: 24, width: 24, objectFit: 'contain' }} />}
        action={
          <Button
            variant="outlined"
            size="small"
            sx={{ bgcolor: 'white', py: 1, pr: 2, mr: 2 }}
            href="https://canyonlog.org/map/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${t('common:partners.canyonLog')} map`}
            endIcon={<OpenInNewIcon fontSize="small" />}
          >
            <img src="/images/canyonlog/side logo.png" alt={`Open ${t('common:partners.canyonLog')} map`} style={{ height: 20, width: 'auto', objectFit: 'contain', display: 'block' }} />
          </Button>
        }
      >
        {t('canyon.findTopo')}
      </Alert>
      <Box my={2} alignContent="end" display="flex" flexDirection="row" alignItems="center" gap={1} justifyContent="flex-end">
        <Box>
          <Box alignContent="end" display="flex" flexDirection="row" alignItems="center" gap={1}>         
            <InputLabel id="filter-sort-by">{t('common:canyon.sortBy')}</InputLabel>
            <Select
              size='small'
              labelId="filter-sort-by"
              label={t('common:canyon.sortBy')}
              style={{width: "150px"}}
              value={sort}
              onChange={e => {
                const sortVal = e.target.value as SortOptionEnum;
                setSort(sortVal)
              }}
            >
              {Object.values(SortParams).map(({ option, displayName }) => (
                <MenuItem key={option} value={option}>{displayName}</MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </Box>
      <FilterPanel<CanyonListEntry>
        items={canyons}
        config={filterConfig}
        filterFn={filterFn}
      >
        {(filteredCanyons) => <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('common:fields.name')}</TableCell>
                <TableCell className='hide-md'>{t('common:fields.grade')}</TableCell>
                <TableCell className='hide-md'>{t('common:fields.region')}</TableCell>
                <TableCell className='hide-md'>{t('common:canyon.canyonType')}</TableCell>
                <TableCell align="center">{t('canyon.yourDescents')}</TableCell>
                <TableCell className='hide-sm' align="center">{t('canyon.lastDescent')}</TableCell>
                <TableCell align="center">{t('common:canyon.topo')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getSortedCanyons(filteredCanyons).map(canyon => (
                <TableRow key={canyon.Key}>
                  <CanyonNameTableCell name={canyon.Name} detailUrl={canyon.DetailUrl}/>
                  <TableCell className='hide-md'>
                    <CanyonRating
                      aquaticRating={canyon.AquaticRating}
                      verticalRating={canyon.VerticalRating}
                      commitmentRating={canyon.CommitmentRating}
                      starRating={canyon.StarRating}
                      isUnrated={canyon.IsUnrated}
                    />
                  </TableCell>
                  <TableCell className='hide-md'>{GetRegionDisplayName(canyon.RegionSlug, canyon.RegionSymbol)}</TableCell>
                  <CanyonTypeTableCell type={canyon.CanyonType} className='hide-md'/>
                  <TableCell align="center">{canyon.Descents}</TableCell>
                  <DateTableCell className='hide-sm' date={canyon.LastDescentDate} />
                  <TableCell align="center">
                    {canyon.Url ? (
                      <Button
                        type='button'
                        variant="outlined"
                        size="small"
                        href={canyon.Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={
                          canyon.SourceLogoUrl
                            ? <img src={canyon.SourceLogoUrl} alt={canyon.SourceName ?? ''} style={{ height: 16, width: 16, objectFit: 'contain' }} />
                            : <OpenInNewIcon fontSize="small" />
                        }
                      >
                        {t('common:canyon.topo')}
                      </Button>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>}
      
        
      </FilterPanel>
    </PageTemplate>
  );
};

export default CanyonList;



