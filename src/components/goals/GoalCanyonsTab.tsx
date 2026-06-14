import { Alert, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { t } from "i18next";
import { GetRegionDisplayName } from "../../helpers/RegionHelper";
import { CanyonListEntry } from "../../types/Canyon";
import { CanyonTypeEnum } from "../../types/CanyonTypeEnum";
import CanyonRating from "../CanyonRating";
import FilterPanel, { FilterValues } from "../FilterPanel";
import RegionIcon from "../RegionIcon";
import CanyonNameTableCell from "../table/CanyonNameCell";
import CanyonTypeTableCell from "../table/CanyonTypeCell";
import DateTableCell from "../table/DateTableCell";
import { Goal } from "../../types/Goal";
import React, { useCallback, useEffect, useMemo } from "react";
import { getCanyonNameFilterConfig, getHasCanyonDescentsFilterConfig, getRegionFilterConfig } from "../../helpers/filterConfigs";
import { apiFetch } from "../../utils/api";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Loader from "../Loader";
import * as RegionDataStore from "../../helpers/RegionDataStore";
import { Region } from "../../types/Region";

const GoalCanyonsTab: React.FC<{ goal: Goal | null }> = ({ goal }) => {

  const isValid = goal != null && goal.RegionId != null;

  const [isLoading, setIsLoading] = React.useState(true);
  const [canyons, setCanyons] = React.useState<CanyonListEntry[]>([]);
  const [flatRegions, setFlatRegions] = React.useState<Region[]>([]);

  const usedRegionIds = useMemo(
      () => {
        return [...new Set(canyons.map(c => c.RegionId).filter((id): id is number => id != null))];
      },
      [canyons]
    );

  const filterConfig = useMemo(() => [
      getCanyonNameFilterConfig(),
      getHasCanyonDescentsFilterConfig(),
      getRegionFilterConfig('region', usedRegionIds),
    ], [usedRegionIds]);

  useEffect(() => {
    if (!isValid) return; // Don't bother loading if we don't have a valid goal with a region


    setIsLoading(true);

    // Load canyons and filter config in parallel
    Promise.all([
      apiFetch<CanyonListEntry[]>(`/api/goals/${goal!.Id}/canyons`),
      RegionDataStore.load(),
    ]).then(([canyons, regions]) => {
      setCanyons(canyons);
      setFlatRegions(regions);
      setIsLoading(false);
    });
  }, [goal?.Id, isValid]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterFn = useCallback((canyon: CanyonListEntry, values: FilterValues) => {
    if (values.name) {
      const nf = (values.name as string).trim().toLowerCase();
      if (nf && !canyon.Name.toLowerCase().includes(nf)) return false;
    }

    if (values.hasDescents) {
      if (values.hasDescents === 'yes' && canyon.Descents === 0) return false;
      if (values.hasDescents === 'no' && canyon.Descents > 0) return false;
    }

    if (values.region != null && canyon.RegionId != null) {
          const ids = RegionDataStore.getDescendantIds(values.region as number, flatRegions);
          if (!ids.includes(canyon.RegionId)) return false;
        } else if (values.region != null && canyon.RegionId == null) {
          return false;
        }

    return true;
  }, [flatRegions]);

  if (!isValid) return <Alert severity="error">Goal Does not support Canyons Tab!</Alert>;

  return (
    <Loader isLoading={isLoading} >
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
              {filteredCanyons.map(canyon => (
                <TableRow key={canyon.Key}>
                  <CanyonNameTableCell name={canyon.Name} detailUrl={canyon.DetailUrl} />
                  <TableCell className='hide-md'>
                    <CanyonRating
                      aquaticRating={canyon.AquaticRating}
                      verticalRating={canyon.VerticalRating}
                      commitmentRating={canyon.CommitmentRating}
                      starRating={canyon.StarRating}
                      isUnrated={canyon.IsUnrated}
                    />
                  </TableCell>
                  <TableCell className='hide-md'><RegionIcon regionSlug={canyon.RegionSlug ?? ''} regionSymbol={canyon.RegionSymbol} size={16} />&nbsp;{GetRegionDisplayName(canyon.RegionSlug)}</TableCell>
                  <CanyonTypeTableCell type={canyon.CanyonType ?? CanyonTypeEnum.Unknown} className='hide-md' />
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
        </TableContainer>
        }


      </FilterPanel>
    </Loader>
  )
}

export default GoalCanyonsTab;