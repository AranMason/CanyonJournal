import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Divider, Autocomplete, CircularProgress } from '@mui/material';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import SuccessSnackbar from '../components/SuccessSnackbar';
import { GearRopeSelector } from '../components/GearRopeSelector';
import { Canyon } from '../types/Canyon';
import { apiFetch } from '../utils/api';

const today = new Date().toISOString().split('T')[0];

const RecordSchema = Yup.object().shape({
  name: Yup.string().required('Canyon name is required'),
  date: Yup.string().required('Date is required'),
  url: Yup.string().url('Must be a valid URL').nullable(),
  teamSize: Yup.number().min(1, 'Team size must be at least 1').required('Team size is required'),
  comments: Yup.string(),
});

const RecordPage: React.FC = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [canyons, setCanyons] = useState<Canyon[]>([]);
  const [canyonsLoading, setCanyonsLoading] = useState(false);

  useEffect(() => {
    setCanyonsLoading(true);
    apiFetch<Canyon[]>('/api/canyons')
      .then(data => setCanyons(data))
      .finally(() => setCanyonsLoading(false));
  }, []);

  const customCanyonOption = { id: -1, name: 'Other', url: '', aquaticRating: 0, verticalRating: 0, starRating: 0 };
  const canyonOptions = [...canyons, customCanyonOption];

  return (
    <PageTemplate pageTitle="Record Canyon">
      <Box maxWidth={400} mx="auto" mt={4}>
        <Formik
          initialValues={{ name: '', date: today, url: '', teamSize: null, comments: '', ropeIds: [], gearIds: [], canyonId: undefined }}
          validationSchema={Yup.object().shape({
            name: Yup.string().when('canyonId', {
              is: (val: number | undefined) => val === -1 || !val,
              then: schema => schema.required('Canyon name is required'),
              otherwise: schema => schema,
            }),
            date: Yup.string().required('Date is required'),
            url: Yup.string().when('canyonId', {
              is: (val: number | undefined) => val === -1 || !val,
              then: schema => schema.url('Must be a valid URL').nullable(),
              otherwise: schema => schema,
            }),
            teamSize: Yup.number().min(1, 'Team size must be at least 1').required('Team size is required'),
            comments: Yup.string(),
          })}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            try {
              await apiFetch('/api/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...values,
                  ropeIds: values.ropeIds,
                  gearIds: values.gearIds,
                  canyonId: values.canyonId || null,
                }),
              });
              resetForm();
              setSnackbarOpen(true);
              navigate('/');
            } catch (err: any) {
              if (err.message !== 'Unauthorized') {
                alert(err.message || 'Failed to record canyon.');
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, handleChange, handleBlur, values, setFieldValue, isSubmitting }) => {
            // Find selected canyon by id
            const selectedCanyon = canyonOptions.find(c => c.id === values.canyonId);
            return (
              <Form>
                <Autocomplete
                  options={canyonOptions}
                  getOptionLabel={option => typeof option === 'string' ? option : option.name}
                  loading={canyonsLoading}
                  onChange={(_, canyon) => {
                    if (!canyon || (typeof canyon === 'string')) {
                      setFieldValue('canyonId', -1);
                      setFieldValue('name', '');
                      setFieldValue('url', '');
                    } else if (canyon.id === -1) {
                      setFieldValue('canyonId', -1);
                      setFieldValue('name', '');
                      setFieldValue('url', '');
                    } else {
                      setFieldValue('canyonId', canyon.id);
                      setFieldValue('name', canyon.name);
                      setFieldValue('url', canyon.url);
                    }
                  }}
                  value={
                    typeof values.canyonId === 'undefined' ? null : canyonOptions.find(c => c.id === values.canyonId) || null
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Canyon"
                      name="canyon"
                      onBlur={handleBlur}
                      required
                      margin="normal"
                    />
                  )}
                  isOptionEqualToValue={(option, value) => {
                    if (typeof option === 'string' || typeof value === 'string') return option === value;
                    return option.id === value.id;
                  }}
                />
                <TextField
                  label="Name of the Canyon"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required={values.canyonId === -1}
                  margin="normal"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  disabled={!!selectedCanyon && selectedCanyon.id !== -1}
                />
                <TextField
                  label="Canyon Link URL"
                  name="url"
                  value={values.url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.url && Boolean(errors.url)}
                  helperText={touched.url && errors.url}
                  disabled={!!selectedCanyon && selectedCanyon.id !== -1}
                />
                <TextField
                  label="Date"
                  type="date"
                  name="date"
                  value={values.date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={touched.date && Boolean(errors.date)}
                  helperText={touched.date && errors.date}
                />
                <TextField
                  label="Team Size"
                  type="number"
                  name="teamSize"
                  value={values.teamSize}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  margin="normal"
                  inputProps={{ min: 1 }}
                  error={touched.teamSize && Boolean(errors.teamSize)}
                  helperText={touched.teamSize && errors.teamSize}
                />
                <TextField
                  label="Comments"
                  name="comments"
                  value={values.comments}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  multiline
                  minRows={3}
                  error={touched.comments && Boolean(errors.comments)}
                  helperText={touched.comments && errors.comments}
                />
                <Typography variant="h6" sx={{ mb: 1, pt: 2 }}>Gear & Rope Used</Typography>
                <GearRopeSelector
                  selectedRopeIds={values.ropeIds}
                  setSelectedRopeIds={ids => setFieldValue('ropeIds', ids)}
                  selectedGearIds={values.gearIds}
                  setSelectedGearIds={ids => setFieldValue('gearIds', ids)}
                />
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={isSubmitting}>
                  Submit
                </Button>
              </Form>
            );
          }}
        </Formik>
      </Box>
      <SuccessSnackbar open={snackbarOpen} message="Canyon record added!" onClose={() => setSnackbarOpen(false)} />
    </PageTemplate>
  );
};

export default RecordPage;
