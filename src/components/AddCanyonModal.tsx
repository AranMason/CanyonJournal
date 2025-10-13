import React from 'react';
import { Button, TextField, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Divider, FormControl, InputLabel, Checkbox, FormControlLabel, Select, MenuItem } from '@mui/material';
import { apiFetch } from '../utils/api';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CanyonRating from './CanyonRating';
import { Canyon } from '../types/Canyon';
import RegionType, { RegionTypeList } from '../types/RegionEnum';
import { CanyonTypeEnum, CanyonTypeList } from '../types/CanyonTypeEnum';
import { GetCanyonTypeDisplayName, GetRegionDisplayName } from '../heleprs/EnumMapper';

interface AddCanyonModalProps {
  canyon: Canyon | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddCanyonModal: React.FC<AddCanyonModalProps> = ({ canyon, open, onClose, onSuccess }) => {

  const initialValues = {
    id: canyon?.Id || undefined,
    name: canyon?.Name || '',
    url: canyon?.Url || '',
    aquaticRating: canyon?.AquaticRating || 1,
    verticalRating: canyon?.VerticalRating || 1,
    starRating: canyon?.StarRating || 0,
    commitmentRating: canyon?.CommitmentRating || 0,
    isUnrated: canyon?.IsUnrated || false,
    canyonRegion: canyon?.Region || RegionType.Unknown,
    canyonType: canyon?.CanyonType || CanyonTypeEnum.Unknown
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add New Canyon</DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object({
            name: Yup.string().required('Name is required'),
            url: Yup.string().url('Must be a valid URL').nullable(),
            aquaticRating: Yup.number().min(1, 'Min 1').max(7, 'Max 7').required('Aquatic rating is required'),
            verticalRating: Yup.number().min(1, 'Min 1').max(7, 'Max 7').required('Vertical rating is required'),
            starRating: Yup.number().min(0, 'Min 0').max(5, 'Max 5').required('Star rating is required'),
            commitmentRating: Yup.number().min(0, 'Min 0').max(5, 'Max 5').required('Commitment rating is required'),
          })}
          onSubmit={async (values, { setSubmitting, setStatus, resetForm }) => {
            setStatus(undefined);
            try {
              await apiFetch('/api/canyons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...values,
                  aquaticRating: Number(values.aquaticRating),
                  verticalRating: Number(values.verticalRating),
                  starRating: Number(values.starRating),
                  commitmentRating: Number(values.commitmentRating),
                }),
              });
              setStatus({ success: true });
              resetForm();
              if (onSuccess) onSuccess();
              onClose();
            } catch (err: any) {
              setStatus({ error: err.message || 'Failed to add canyon' });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, status }) => (
            <Form>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Name"
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
                  label="URL (CanyonLog or similar)"
                  name="url"
                  value={values.url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={touched.url && Boolean(errors.url)}
                  helperText={touched.url && errors.url}
                />
                <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
                  <InputLabel id="canyon-type">Canyon Type</InputLabel>
                  <Select
                    labelId="canyon-type"
                    label="Canyon Type"
                    value={values.canyonRegion}
                    onChange={e => setFieldValue('canyonRegion', e.target.value as number)}
                    fullWidth
                    error={touched.canyonRegion && Boolean(errors.canyonRegion)}
                  >
                    {RegionTypeList.map((region) => (
                      <MenuItem key={region} value={region}>{GetRegionDisplayName(region)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
                  <InputLabel id="canyon-region">Region</InputLabel>
                  <Select
                    labelId="canyon-region"
                    label="Region"
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
                <Divider />
                <CanyonRating aquaticRating={values.aquaticRating} verticalRating={values.verticalRating} commitmentRating={values.commitmentRating} starRating={values.starRating} isUnrated={values.isUnrated} />
                <FormControlLabel control={<Checkbox
                  checked={values.isUnrated}
                  name='isUnrated'
                  onChange={handleChange}
                  inputProps={{ 'aria-label': 'controlled' }} />} label="Is Unrated">

                </FormControlLabel>
                <TextField
                  label="Vertical Rating"
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
                  label="Aquatic Rating"
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
                  label="Commitment Rating"
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
                  label="Star Rating"
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
                {status && status.error && <Typography color="error">{status.error}</Typography>}
                {status && status.success && <Typography color="success.main">Canyon added!</Typography>}
              </Stack>
              <DialogActions sx={{ mt: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>Add Canyon</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddCanyonModal;
