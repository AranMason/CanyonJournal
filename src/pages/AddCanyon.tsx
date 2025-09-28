import React from 'react';
import { Box, Button, TextField, Typography, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import PageTemplate from './PageTemplate';
import CanyonRating from '../components/CanyonRating';

const AddCanyon: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageTemplate pageTitle="Add Canyon">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper sx={{ p: 4, minWidth: 340, maxWidth: 400 }}>
          <Typography variant="h5" mb={2}>Add New Canyon</Typography>
          <Formik
            initialValues={{
              name: '',
              url: '',
              aquaticRating: undefined,
              verticalRating: undefined,
              starRating: undefined,
              commitmentRating: undefined,
            }}
            validationSchema={Yup.object({
              name: Yup.string().required('Name is required'),
              url: Yup.string().url('Must be a valid URL').nullable(),
              aquaticRating: Yup.number().min(1, 'Min 1').max(7, 'Max 7').required('Aquatic rating is required'),
              verticalRating: Yup.number().min(1, 'Min 1').max(7, 'Max 7').required('Vertical rating is required'),
              starRating: Yup.number().min(1, 'Min 1').max(3, 'Max 3').required('Star rating is required'),
              commitmentRating: Yup.number().min(1, 'Min 1').max(3, 'Max 3').required('Commitment rating is required'),
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
                setTimeout(() => navigate('/'), 1200);
              } catch (err: any) {
                setStatus({ error: err.message || 'Failed to add canyon' });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting, status }) => (
              <Form>
                <Stack spacing={2}>
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
                    label="URL"
                    name="url"
                    value={values.url}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    error={touched.url && Boolean(errors.url)}
                    helperText={touched.url && errors.url}
                  />
                  <CanyonRating aquaticRating={values.aquaticRating} verticalRating={values.verticalRating} commitmentRating={values.commitmentRating} starRating={values.starRating} />
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
                    label="Star Rating"
                    name="starRating"
                    value={values.starRating}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    fullWidth
                    type="number"
                    inputProps={{ min: 1, max: 3 }}
                    error={touched.starRating && Boolean(errors.starRating)}
                    helperText={touched.starRating && errors.starRating}
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
                    inputProps={{ min: 1, max: 3 }}
                    error={touched.commitmentRating && Boolean(errors.commitmentRating)}
                    helperText={touched.commitmentRating && errors.commitmentRating}
                  />
                  {status && status.error && <Typography color="error">{status.error}</Typography>}
                  {status && status.success && <Typography color="success.main">Canyon added!</Typography>}
                  <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>Add Canyon</Button>
                </Stack>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </PageTemplate>
  );
};

export default AddCanyon;
