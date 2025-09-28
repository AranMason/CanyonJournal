import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { GearItem } from '../types/types';

interface GearModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialValues?: any;
}

const GearSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  category: Yup.string().required('Category is required'),
  notes: Yup.string(),
});

const GearModal: React.FC<GearModalProps> = ({ open, onClose, onSubmit, initialValues }) => {

  // Map initialValues from PascalCase to lowercase if editing
  const mappedInitialValues = initialValues
    ? {
        name: initialValues.Name ?? '',
        category: initialValues.Category ?? '',
        notes: initialValues.Notes ?? '',
      }
    : { name: '', category: '', notes: '' };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialValues ? 'Edit Gear' : 'Add Gear'}</DialogTitle>
      <Formik
        initialValues={mappedInitialValues}
        validationSchema={GearSchema}
        onSubmit={(values, { resetForm }) => {
          onSubmit(values);
          resetForm();
          onClose();
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField label="Name" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} fullWidth required error={touched.name && Boolean(errors.name)} helperText={typeof errors.name === 'string' && touched.name ? errors.name : undefined} />
                <TextField label="Category" name="category" value={values.category} onChange={handleChange} onBlur={handleBlur} fullWidth required error={touched.category && Boolean(errors.category)} helperText={typeof errors.category === 'string' && touched.category ? errors.category : undefined} />
                <TextField label="Notes" name="notes" value={values.notes} onChange={handleChange} onBlur={handleBlur} fullWidth multiline minRows={2} error={touched.notes && Boolean(errors.notes)} helperText={typeof errors.notes === 'string' && touched.notes ? errors.notes : undefined} />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>{initialValues ? 'Save' : 'Add'}</Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default GearModal;
