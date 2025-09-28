import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Autocomplete } from '@mui/material';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import SuccessSnackbar from '../components/SuccessSnackbar';
import { GearRopeSelector } from '../components/GearRopeSelector';
import { Canyon } from '../types/Canyon';
import { apiFetch } from '../utils/api';
import { CanyonRecord } from '../types/CanyonRecord';

type OtherOption = {
  Id: -1;
  Name: string;
  Url: string;
  AquaticRating: number;
  VerticalRating: number;
  StarRating: number;
}

const today = new Date().toISOString().split('T')[0];

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

  const customCanyonOption: OtherOption = { Id: -1, Name: 'Other', Url: '', AquaticRating: 0, VerticalRating: 0, StarRating: 0 };
  const canyonOptions: (Canyon | OtherOption)[] = [...canyons, customCanyonOption];

  const initialValues: CanyonRecord = { Name: '', Date: today, Url: '', TeamSize: undefined, Comments: '', RopeIds: [], GearIds: [], CanyonId: undefined };

  return (
    <PageTemplate pageTitle="Record Descent" isAuthRequired>
      <Box maxWidth={400} mx="auto" mt={4}>
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object().shape({
            Name: Yup.string().when('CanyonId', {
              is: (val: number | undefined) => val === -1 || !val,
              then: schema => schema.required('Canyon name is required'),
              otherwise: schema => schema,
            }),
            Date: Yup.string().required('Date is required'),
            Url: Yup.string().when('CanyonId', {
              is: (val: number | undefined) => val === -1 || !val,
              then: schema => schema.url('Must be a valid URL').nullable(),
              otherwise: schema => schema,
            }),
            TeamSize: Yup.number().min(1, 'Team size must be at least 1').required('Team size is required'),
            Comments: Yup.string(),
          })}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            try {
              await apiFetch('/api/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...values,
                  RopeIds: values.RopeIds,
                  GearIds: values.GearIds,
                  CanyonId: values.CanyonId || null,
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
            const selectedCanyon = canyonOptions.find(c => c.Id === values.CanyonId);
            return (
              <Form>
                <Autocomplete
                  options={canyonOptions}
                  getOptionLabel={option => typeof option === 'string' ? option : option.Name}
                  loading={canyonsLoading}
                  onChange={(_, canyon) => {
                    if (!canyon || (typeof canyon === 'string')) {
                      setFieldValue('CanyonId', -1);
                      setFieldValue('Name', '');
                      setFieldValue('Url', '');
                    } else if (canyon.Id === -1) {
                      setFieldValue('CanyonId', -1);
                      setFieldValue('Name', '');
                      setFieldValue('Url', '');
                    } else {
                      setFieldValue('CanyonId', canyon.Id);
                      setFieldValue('Name', canyon.Name);
                      setFieldValue('Url', canyon.Url);
                    }
                  }}
                  value={
                    typeof values.CanyonId === 'undefined' ? null : canyonOptions.find(c => c.Id === values.CanyonId) || null
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Canyon"
                      name="Canyon"
                      onBlur={handleBlur}
                      required
                      margin="normal"
                    />
                  )}
                  isOptionEqualToValue={(option, value) => {
                    if (typeof option === 'string' || typeof value === 'string') return option === value;
                    return option.Id === value.Id;
                  }}
                />
                <TextField
                  label="Name of the Canyon"
                  name="Name"
                  value={values.Name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required={values.CanyonId === -1}
                  margin="normal"
                  error={touched.Name && Boolean(errors.Name)}
                  helperText={touched.Name && errors.Name}
                  disabled={!!selectedCanyon && selectedCanyon.Id !== -1}
                />
                <TextField
                  label="Canyon Link URL"
                  name="Url"
                  value={values.Url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.Url && Boolean(errors.Url)}
                  helperText={touched.Url && errors.Url}
                  disabled={!!selectedCanyon && selectedCanyon.Id !== -1}
                />
                <TextField
                  label="Date"
                  type="date"
                  name="Date"
                  value={values.Date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={touched.Date && Boolean(errors.Date)}
                  helperText={touched.Date && errors.Date}
                />
                <TextField
                  label="Team Size"
                  type="number"
                  name="TeamSize"
                  value={values.TeamSize}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  margin="normal"
                  inputProps={{ min: 1 }}
                  error={touched.TeamSize && Boolean(errors.TeamSize)}
                  helperText={touched.TeamSize && errors.TeamSize}
                />
                <TextField
                  label="Comments"
                  name="Comments"
                  value={values.Comments}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  multiline
                  minRows={3}
                  error={touched.Comments && Boolean(errors.Comments)}
                  helperText={touched.Comments && errors.Comments}
                />
                <Typography variant="h6" sx={{ mb: 1, pt: 2 }}>Gear & Rope Used</Typography>
                <GearRopeSelector
                  selectedRopeIds={values.RopeIds}
                  setSelectedRopeIds={ids => setFieldValue('RopeIds', ids)}
                  selectedGearIds={values.GearIds}
                  setSelectedGearIds={ids => setFieldValue('GearIds', ids)}
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
