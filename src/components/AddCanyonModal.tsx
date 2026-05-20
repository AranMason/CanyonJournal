import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Divider, FormControl, InputLabel, Checkbox, FormControlLabel, Select, MenuItem } from '@mui/material';
import { apiFetch } from '../utils/api';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CanyonRating from './CanyonRating';
import { Canyon, CanyonSource } from '../types/Canyon';
import { UserCanyon } from '../types/UserCanyon';
import { CanyonTypeEnum, CanyonTypeList } from '../types/CanyonTypeEnum';
import { GetCanyonTypeDisplayName } from '../helpers/EnumMapper';
import RegionTreePicker from './RegionTreePicker';
import { useTranslation } from 'react-i18next';

export interface CanyonModalFormValues {
  id?: number;
  name: string;
  url: string;
  aquaticRating: number;
  verticalRating: number;
  starRating: number;
  commitmentRating: number;
  isUnrated: boolean;
  canyonRegionId: number | null;
  canyonType: CanyonTypeEnum;
  notes: string;
  sourceId: number | '';
}

interface AddCanyonModalProps {
  canyon: Canyon | UserCanyon | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  showNotes?: boolean;
  showCanyonType?: boolean;
  showSource?: boolean;
  onSubmit?: (values: CanyonModalFormValues) => Promise<void>;
}

const AddCanyonModal: React.FC<AddCanyonModalProps> = ({
  canyon, open, onClose, onSuccess,
  title,
  showNotes = false,
  showCanyonType = true,
  showSource = false,
  onSubmit: customOnSubmit,
}) => {
  const [sources, setSources] = useState<CanyonSource[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (showSource && open) {
      apiFetch<CanyonSource[]>('/api/sources').then(setSources).catch(() => {});
    }
  }, [showSource, open]);

  const initialValues: CanyonModalFormValues = {
    id: canyon?.Id || undefined,
    name: canyon?.Name || '',
    url: canyon?.Url || '',
    aquaticRating: canyon?.AquaticRating || 1,
    verticalRating: canyon?.VerticalRating || 1,
    starRating: canyon?.StarRating || 0,
    commitmentRating: canyon?.CommitmentRating || 0,
    isUnrated: canyon?.IsUnrated || false,
    canyonRegionId: (canyon as Canyon)?.RegionId ?? (canyon as UserCanyon)?.RegionId ?? null,
    canyonType: (canyon as Canyon)?.CanyonType || CanyonTypeEnum.Unknown,
    notes: (canyon as UserCanyon)?.Notes || '',
    sourceId: (canyon as Canyon)?.SourceId || '',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title ?? t('admin.addCanyon')}</DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={Yup.object({
            name: Yup.string().required('Name is required'),
            url: Yup.string().url('Must be a valid URL').nullable(),
            aquaticRating: Yup.number().min(1, 'Min 1').max(7, 'Max 7').required('Aquatic rating is required'),
            verticalRating: Yup.number().min(1, 'Min 1').max(7, 'Max 7').required('Vertical rating is required'),
            starRating: Yup.number().min(0, 'Min 0').max(5, 'Max 5').required('Star rating is required'),
            commitmentRating: Yup.number().min(0, 'Min 0').max(6, 'Max 6').required('Commitment rating is required'),
          })}
          onSubmit={async (values, { setSubmitting, setStatus, resetForm }) => {
            setStatus(undefined);
            try {
              if (customOnSubmit) {
                await customOnSubmit(values);
              } else {
                await apiFetch('/api/canyons', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...values,
                    aquaticRating: Number(values.aquaticRating),
                    verticalRating: Number(values.verticalRating),
                    starRating: Number(values.starRating),
                    commitmentRating: Number(values.commitmentRating),
                    sourceId: values.sourceId !== '' ? Number(values.sourceId) : null,
                  }),
                });
              }
              setStatus({ success: true });
              resetForm();
              if (onSuccess) onSuccess();
              onClose();
            } catch (err: any) {
              setStatus({ error: err.message || 'Failed to save canyon' });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, status }) => (
            <Form>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label={t('common:fields.name')}
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  fullWidth
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
                <TextField
                  label={t('common:canyon.urlField')}
                  name="url"
                  value={values.url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={touched.url && Boolean(errors.url)}
                  helperText={touched.url && errors.url}
                />
                <RegionTreePicker
                  value={values.canyonRegionId}
                  onChange={v => setFieldValue('canyonRegionId', v)}
                  allowClear
                />
                {showCanyonType && (
                  <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
                    <InputLabel id="canyon-type">{t('common:canyon.canyonType')}</InputLabel>
                    <Select
                      labelId="canyon-type"
                      label={t('common:canyon.canyonType')}
                      value={values.canyonType}
                      onChange={e => setFieldValue('canyonType', e.target.value as number)}
                      fullWidth
                      error={touched.canyonType && Boolean(errors.canyonType)}
                    >
                      {CanyonTypeList.map((type) => (
                        <MenuItem key={type} value={type}>{GetCanyonTypeDisplayName(type)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {showSource && (
                  <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
                    <InputLabel id="canyon-source">{t('common:fields.source')}</InputLabel>
                    <Select
                      labelId="canyon-source"
                      label={t('common:fields.source')}
                      value={values.sourceId}
                      onChange={e => setFieldValue('sourceId', e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="">{t('common:unknown')}</MenuItem>
                      {sources.map(s => (
                        <MenuItem key={s.Id} value={s.Id}>{s.DisplayName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <Divider />
                <Typography my={2} align='center' variant='h6'>
                  <CanyonRating aquaticRating={values.aquaticRating} verticalRating={values.verticalRating} commitmentRating={values.commitmentRating} starRating={values.starRating} isUnrated={values.isUnrated} />
                </Typography>
                <FormControlLabel control={<Checkbox
                  checked={values.isUnrated}
                  name='isUnrated'
                  onChange={handleChange}
                  inputProps={{ 'aria-label': 'controlled' }} />} label={t('common:canyon.noRating')} />
                <TextField
                  label={t('common:canyon.vertical')}
                  name="verticalRating"
                  value={values.verticalRating}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  fullWidth
                  type="number"
                  inputProps={{ min: 1, max: 7 }}
                  error={touched.verticalRating && Boolean(errors.verticalRating)}
                  helperText={touched.verticalRating && errors.verticalRating}
                />
                <TextField
                  label={t('common:canyon.aquatic')}
                  name="aquaticRating"
                  value={values.aquaticRating}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  fullWidth
                  type="number"
                  inputProps={{ min: 1, max: 7 }}
                  error={touched.aquaticRating && Boolean(errors.aquaticRating)}
                  helperText={touched.aquaticRating && errors.aquaticRating}
                />
                <TextField
                  label={t('common:canyon.commitment')}
                  name="commitmentRating"
                  value={values.commitmentRating}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  fullWidth
                  type="number"
                  inputProps={{ min: 0, max: 6 }}
                  error={touched.commitmentRating && Boolean(errors.commitmentRating)}
                  helperText={touched.commitmentRating && errors.commitmentRating}
                />
                <TextField
                  label={t('common:canyon.stars')}
                  name="starRating"
                  value={values.starRating}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  fullWidth
                  type="number"
                  inputProps={{ min: 0, max: 5 }}
                  error={touched.starRating && Boolean(errors.starRating)}
                  helperText={touched.starRating && errors.starRating}
                />
                {showNotes && (
                  <TextField
                    label={t('canyon.notesOptional')}
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                )}
                {status?.error && <Typography color="error">{status.error}</Typography>}
                {status?.success && <Typography color="success.main">{t('canyon.canyonSaved')}</Typography>}
              </Stack>
              <DialogActions sx={{ mt: 2 }}>
                <Button onClick={onClose}>{t('common:actions.cancel')}</Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>{t('common:actions.save')}</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddCanyonModal;


