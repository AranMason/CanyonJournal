import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Divider } from '@mui/material';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import SuccessSnackbar from '../components/SuccessSnackbar';
import { GearRopeSelector } from '../components/GearRopeSelector';

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

  return (
    <PageTemplate pageTitle="Record Canyon">
      <Box maxWidth={400} mx="auto" mt={4}>
        <Formik
          initialValues={{ name: '', date: today, url: '', teamSize: 1, comments: '', ropeIds: [], gearIds: [] }}
          validationSchema={RecordSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            try {
              const response = await fetch('/api/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...values,
                  ropeIds: values.ropeIds,
                  gearIds: values.gearIds,
                }),
              });
              if (response.status === 401) {
                navigate('/');
                return;
              }
              if (response.ok) {
                resetForm();
                setSnackbarOpen(true);
                navigate('/');
              } else {
                const error = await response.json();
                alert(error.error || 'Failed to record canyon.');
              }
            } catch (err) {
              alert('Network error.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, handleChange, handleBlur, values, setFieldValue, isSubmitting }) => (
            <Form>
              <TextField
                label="Name of the Canyon"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                required
                margin="normal"
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
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
                label="Canyon Link URL"
                name="url"
                value={values.url}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                margin="normal"
                error={touched.url && Boolean(errors.url)}
                helperText={touched.url && errors.url}
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
          )}
        </Formik>
      </Box>
      <SuccessSnackbar open={snackbarOpen} message="Canyon record added!" onClose={() => setSnackbarOpen(false)} />
    </PageTemplate>
  );
};

export default RecordPage;
