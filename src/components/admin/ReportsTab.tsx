import React, { useEffect, useState } from 'react';
import {
  Box, Button, Chip, FormControl, IconButton, InputLabel, Link,
  Paper, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../utils/api';
import { CanyonReport } from '../../types/CanyonReport';
import { ReportStatus, ReportStatusList } from '../../types/ReportStatus';
import { GetReportIssueTypeDisplayName, GetReportStatusDisplayName } from '../../helpers/EnumMapper';
import { Canyon } from '../../types/Canyon';
import AddCanyonModal from '../AddCanyonModal';

const statusColour: Record<ReportStatus, 'default' | 'warning' | 'success' | 'error'> = {
  [ReportStatus.Pending]: 'warning',
  [ReportStatus.TBD]: 'default',
  [ReportStatus.Reviewed]: 'success',
  [ReportStatus.Rejected]: 'error',
};

type StatusFilter = ReportStatus | 'active' | 'all';

const ReportsTab: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<CanyonReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [editingCanyon, setEditingCanyon] = useState<Canyon | null>(null);
  // Per-row edit state: reportId → { status, adminNotes, saving }
  const [edits, setEdits] = useState<Record<number, { status: ReportStatus; adminNotes: string; saving: boolean }>>({});

  useEffect(() => {
    setIsLoading(true);
    apiFetch<CanyonReport[]>('/api/reports')
      .then(setReports)
      .finally(() => setIsLoading(false));
  }, []);

  function getEdit(report: CanyonReport) {
    return edits[report.Id] ?? { status: report.Status, adminNotes: report.AdminNotes ?? '', saving: false };
  }

  function setEdit(id: number, patch: Partial<{ status: ReportStatus; adminNotes: string; saving: boolean }>) {
    setEdits(prev => ({ ...prev, [id]: { ...getEditById(id), ...patch } }));
  }

  function getEditById(id: number) {
    const report = reports.find(r => r.Id === id);
    return edits[id] ?? { status: report?.Status ?? ReportStatus.Pending, adminNotes: report?.AdminNotes ?? '', saving: false };
  }

  async function handleSave(report: CanyonReport) {
    const edit = getEdit(report);
    setEdit(report.Id, { saving: true });
    try {
      const updated = await apiFetch<CanyonReport>(`/api/reports/${report.Id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: edit.status, adminNotes: edit.adminNotes }),
      });
      setReports(prev => prev.map(r => r.Id === report.Id ? { ...r, ...updated } : r));
      setEdits(prev => { const next = { ...prev }; delete next[report.Id]; return next; });
    } finally {
      setEdit(report.Id, { saving: false });
    }
  }

  async function handleEditCanyon(canyonId: number) {
    const canyon = await apiFetch<Canyon>(`/api/canyons/${canyonId}`);
    setEditingCanyon(canyon);
  }

  const visibleReports = reports.filter(r => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return r.Status === ReportStatus.Pending || r.Status === ReportStatus.TBD;
    return r.Status === statusFilter;
  });

  if (isLoading) return <Typography>{t('common:loading')}</Typography>;

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            label="Status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          >
            <MenuItem value="active">Active (Pending + TBD)</MenuItem>
            <MenuItem value="all">All</MenuItem>
            {ReportStatusList.map(s => (
              <MenuItem key={s} value={s}>{GetReportStatusDisplayName(s)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {editingCanyon && (
        <AddCanyonModal
          canyon={editingCanyon}
          open={editingCanyon !== null}
          onClose={() => setEditingCanyon(null)}
          title={t('settings.editCanyon')}
          showSource
        />
      )}

      {visibleReports.length === 0 ? (
        <Typography color="text.secondary">{t('admin.noReports')}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('common:terms.canyon.upper', { count: 1 })}</TableCell>
                <TableCell>{t('report.issueType')}</TableCell>
                <TableCell>{t('report.description')}</TableCell>
                <TableCell>{t('admin.reportedBy')}</TableCell>
                <TableCell>{t('admin.dateReported')}</TableCell>
                <TableCell sx={{ minWidth: 130 }}>Status</TableCell>
                <TableCell sx={{ minWidth: 200 }}>{t('admin.adminNotes')}</TableCell>
                <TableCell sx={{ width: 80 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleReports.map(report => {
                const edit = getEdit(report);
                const isDirty = edit.status !== report.Status || edit.adminNotes !== (report.AdminNotes ?? '');
                return (
                  <TableRow key={report.Id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Link href={report.CanyonDetailUrl} underline="hover" variant="body2">
                          {report.CanyonName}
                        </Link>
                        <Tooltip title={t('admin.editCanyon')}>
                          <IconButton size="small" onClick={() => handleEditCanyon(report.CanyonId)} sx={{ color: 'grey.500' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={GetReportIssueTypeDisplayName(report.IssueType)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 220, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {report.Description ?? '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{report.ReporterName} <Typography component="span" variant="caption" color="text.secondary">(#{report.UserId})</Typography></TableCell>
                    <TableCell>{new Date(report.CreatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={edit.status}
                        onChange={e => setEdit(report.Id, { status: e.target.value as ReportStatus })}
                        sx={{ minWidth: 120 }}
                        renderValue={(val) => (
                          <Chip label={GetReportStatusDisplayName(val)} size="small" color={statusColour[val]} />
                        )}
                      >
                        {ReportStatusList.map(s => (
                          <MenuItem key={s} value={s}>{GetReportStatusDisplayName(s)}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        multiline
                        maxRows={3}
                        fullWidth
                        value={edit.adminNotes}
                        onChange={e => setEdit(report.Id, { adminNotes: e.target.value })}
                        placeholder={t('admin.adminNotes')}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant={isDirty ? 'contained' : 'outlined'}
                        disabled={!isDirty || edit.saving}
                        onClick={() => handleSave(report)}
                      >
                        {t('admin.saveNotes')}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ReportsTab;
