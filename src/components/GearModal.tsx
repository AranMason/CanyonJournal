import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { GearItem } from '../types/types';
import FormikTextField from './FormikTextField';
import { useTranslation } from 'react-i18next';

interface GearModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialValues?: GearItem;
}

const GearSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  category: Yup.string().required('Category is required'),
  notes: Yup.string(),
});

const GearModal: React.FC<GearModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  const { t } = useTranslation();

  const mappedInitialValues = initialValues
    ? {
        name: initialValues.Name ?? '',
        category: initialValues.Category ?? '',
        notes: initialValues.Notes ?? '',
      }
    : { name: '', category: '', notes: '' };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialValues ? t('settings.editGear') : t('gear.addGear')}</DialogTitle>
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
                <FormikTextField<typeof values> label={t('common:fields.name')} name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} fullWidth required touched={touched} errors={errors} />
                <FormikTextField<typeof values> label={t('gear.category')} name="category" value={values.category} onChange={handleChange} onBlur={handleBlur} fullWidth required touched={touched} errors={errors} />
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

export default GearModal;

