import { RopeItem, Unit } from '../types/types';
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

interface RopeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialValues?: RopeItem;
}

const RopeSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  diameter: Yup.number().typeError('Diameter must be a number').min(1).required('Diameter is required'),
  length: Yup.number().typeError('Length must be a number').min(1).required('Length is required'),
  unit: Yup.string().oneOf([Unit.Metres, Unit.Feet]).required('Unit is required'),
  notes: Yup.string(),
});

const RopeModal: React.FC<RopeModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  // Map initialValues from PascalCase to lowercase if editing
  const mappedInitialValues = initialValues
    ? {
        name: initialValues.Name ?? '',
        diameter: initialValues.Diameter ?? '',
        length: initialValues.Length ?? '',
        unit: initialValues.Unit ?? Unit.Metres,
        notes: initialValues.Notes ?? '',
      }
    : { name: '', diameter: '', length: '', unit: Unit.Metres, notes: '' };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialValues ? 'Edit Rope' : 'Add Rope'}</DialogTitle>
      <Formik
        initialValues={mappedInitialValues}
        validationSchema={RopeSchema}
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
                <TextField label="Diameter" name="diameter" type="number" value={values.diameter} onChange={handleChange} onBlur={handleBlur} fullWidth required error={touched.diameter && Boolean(errors.diameter)} helperText={typeof errors.diameter === 'string' && touched.diameter ? errors.diameter : undefined} />
                <TextField label="Length" name="length" type="number" value={values.length} onChange={handleChange} onBlur={handleBlur} fullWidth required error={touched.length && Boolean(errors.length)} helperText={typeof errors.length === 'string' && touched.length ? errors.length : undefined} />
                <TextField select label="Unit" name="unit" value={values.unit} onChange={handleChange} onBlur={handleBlur} fullWidth error={touched.unit && Boolean(errors.unit)} helperText={typeof errors.unit === 'string' && touched.unit ? errors.unit : undefined}>
                  <MenuItem value={Unit.Metres}>{Unit.Metres}</MenuItem>
                  <MenuItem value={Unit.Feet}>{Unit.Feet}</MenuItem>
                </TextField>
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

export default RopeModal;
