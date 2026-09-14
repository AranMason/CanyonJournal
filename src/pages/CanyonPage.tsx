import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, Pagination, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CanyonFilterForm, CanyonFilterOptionsRequest, CanyonListEntry } from '../types/Canyon';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import DateTableCell from '../components/table/DateTableCell';
import CanyonNameTableCell from '../components/table/CanyonNameCell';
import CanyonTypeTableCell from '../components/table/CanyonTypeCell';
import { CanyonTypeEnum } from '../types/CanyonTypeEnum';
import * as RegionDataStore from '../helpers/data/RegionDataStore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import CanyonRating from '../components/canyons/CanyonRating';
import { getCanyonPage } from '../helpers/data/CanyonDataStore';
import Loader from '../components/Loader';
import TuneIcon from '@mui/icons-material/Tune';
import CanyonFilterModal from '../components/forms/CanyonFilterModal';

const SortParams: { [key in OrderBy]: {
  option: key,
  displayName: string,
} } = {
  'Descents': {
    option: 'Descents',
    displayName: 'Descents'
  },
  Name: {
    option: 'Name',
    displayName: 'Name'
  },
  LastDescent: {
    option: 'LastDescent',
    displayName: 'Last Descent'
  },
  VerticalRating: {
    option: 'VerticalRating',
    displayName: 'Vertical'
  },
  AquaticRating: {
    option: 'AquaticRating',
    displayName: 'Aquatic'
  },
  CommitmentRating: {
    option: 'CommitmentRating',
    displayName: 'Commitment'
  },
  StarRating: {
    option: 'StarRating',
    displayName: 'Star'
  }
}

type OrderBy = CanyonFilterOptionsRequest["orderBy"];

const CanyonList: React.FC = () => {
  const { user, loading } = useUser();
  const { t } = useTranslation();
  const [canyons, setCanyons] = useState<CanyonListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [totalCanyons, setTotalCanyons] = useState(0);
  const [pageSize] = useState(25);
  const [orderBy, setOrderBy] = useState<OrderBy>('Descents');
  const [filterConfig, setFilterConfig] = useState<CanyonFilterForm>({
    text: '',
    region: null,
    types: []
  });
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const refresh = async () => {
    setIsLoading(true);

    const regions = filterConfig.region ? (await RegionDataStore.getDescendantIds(filterConfig.region)) : [];

    const searchConfig: CanyonFilterOptionsRequest = {
      page,
      pageSize,
      orderBy,
      text: filterConfig.text,
      regions,
      verticalRating: filterConfig.minVerticalRating,
      aquaticRating: filterConfig.minAquaticRating,
      commitmentRating: filterConfig.minCommitmentRating,
      starRating: filterConfig.minStarRating,
      type: filterConfig.types,
      includeMetaData: true
    }
    getCanyonPage(searchConfig).then(({ totalCount, totalPages, results }) => {
      setTotalPages(totalPages);
      setTotalCanyons(totalCount);
      setCanyons(results);
    }).finally(() => setIsLoading(false))
  };

  useEffect(() => {
    if (!loading && user) {
      refresh()
    }

  }, [user, loading, filterConfig, page, pageSize, orderBy])

  return (
    <PageTemplate pageTitle={t('nav.canyons')} isAuthRequired>
      <CanyonFilterModal
        isOpen={isFilterOpen}
        initialFilterValues={filterConfig}
        onFilter={(f) => {
          setPage(1);
          setFilterConfig(f)
        }}
        onClose={() => setIsFilterOpen(false)} />
      <Alert
        severity="info"
        sx={{
          mb: 3, mt: 1, py: 2,
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
        <Box display="flex" flexDirection="row" alignItems="center" gap={1} justifyContent="space-between" flex={1} mb={1}>
          <Button sx={{ display: { xs: 'none', sm: 'flex' } }} variant="contained" color="primary" onClick={() => navigate("/settings?tab=0")} startIcon={<AddLocationAltIcon />}>{t('translation:canyon.createUserCanyon')}</Button>

          <Box display={'flex'} flex={1} gap={2} sx={{ flexDirection: { xs: 'row-reverse', sm: 'row' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
            <Box alignContent="end" display="flex" flexDirection="row" alignItems="center" gap={1}>
              <InputLabel id="filter-sort-by">{t('common:canyon.sortBy')}</InputLabel>
              <Select
                size='small'
                labelId="filter-sort-by"
                label={t('common:canyon.sortBy')}
                style={{ width: "150px" }}
                value={orderBy}
                onChange={e => {
                  const sortVal = e.target.value;
                  setOrderBy(sortVal)
                }}
              >
                {Object.values(SortParams).map(({ option, displayName }) => (
                  <MenuItem key={option} value={option}>{displayName}</MenuItem>
                ))}
              </Select>
            </Box>
            <Button variant={'outlined'} onClick={() => setIsFilterOpen(true)} startIcon={<TuneIcon />}>
              {t('common:actions.filter')}
            </Button>
          </Box>
        </Box>
      </Box>

      <Box display={'flex'} justifyContent={'space-between'} mb={1}>
        <Typography component={'span'} fontSize={12} variant='subtitle2'>{t('translation:canyon.totalItems', { count: totalCanyons })}</Typography>
        <Typography component={'span'} fontSize={12} variant='subtitle2'>{t('translation:canyon.pageNumber', { count: page, total: totalPages })}</Typography>
      </Box>


      <TableContainer component={Paper} sx={{ borderLeft: 2, borderColor: 'secondary.main' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common:fields.name')}</TableCell>
              <TableCell className='hide-md'>{t('common:canyon.canyonType')}</TableCell>
              <TableCell align="center">{t('canyon.yourDescents')}</TableCell>
              <TableCell className='hide-sm' align="center">{t('canyon.lastDescent')}</TableCell>
              <TableCell align="center">{t('common:canyon.topo')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {isLoading && <TableRow><TableCell colSpan={5} sx={{ py: 4 }}><Loader isLoading={isLoading}>Loading...</Loader></TableCell></TableRow>}

            {!isLoading && canyons.map(canyon => (
              <TableRow key={canyon.Key}>
                <TableCell>
                  <CanyonNameTableCell
                    canyon={canyon}
                    detailUrl={canyon.DetailUrl}
                    subtitle={<CanyonRating
                      aquaticRating={canyon.AquaticRating}
                      verticalRating={canyon.VerticalRating}
                      commitmentRating={canyon.CommitmentRating}
                      starRating={canyon.StarRating}
                      isUnrated={canyon.IsUnrated}
                    />}>
                  </CanyonNameTableCell>
                </TableCell>
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



      <Box my={2} display="flex" justifyContent="center">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, pageNumber) => {
            e.preventDefault();
            setPage(pageNumber);
            window.scrollTo(0, 0);
          }} />
      </Box>
    </PageTemplate>
  );
};

export default CanyonList;



