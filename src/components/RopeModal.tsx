import { RopeItem, Unit } from '../types/types';
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Box } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikTextField from './FormikTextField';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      <DialogTitle>{initialValues ? t('settings.editRope') : t('gear.addRope')}</DialogTitle>
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
                <FormikTextField<typeof values> label={t('common:fields.name')} name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} fullWidth required touched={touched} errors={errors} />
                <FormikTextField<typeof values> label={t('gear.diameter')} name="diameter" type="number" value={values.diameter} onChange={handleChange} onBlur={handleBlur} fullWidth required touched={touched} errors={errors} />
                <FormikTextField<typeof values> label={t('gear.length')} name="length" type="number" value={values.length} onChange={handleChange} onBlur={handleBlur} fullWidth required touched={touched} errors={errors} />
                <FormikTextField<typeof values> select label={t('gear.unit')} name="unit" value={values.unit} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors}>
                  <MenuItem value={Unit.Metres}>{Unit.Metres}</MenuItem>
                  <MenuItem value={Unit.Feet}>{Unit.Feet}</MenuItem>
                </FormikTextField>
                <FormikTextField<typeof values> label={t('common:fields.notes')} name="notes" value={values.notes} onChange={handleChange} onBlur={handleBlur} fullWidth multiline minRows={2} touched={touched} errors={errors} />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>{t('common:actions.cancel')}</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>{initialValues ? t('common:actions.save') : t('common:actions.add')}</Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default RopeModal;

