import { RopeItem, Unit } from '../../types/types';
import React, { useState } from 'react';
import { DialogContent, DialogActions, Button, MenuItem, Box, Divider, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikTextField from '../FormikTextField';
import { useTranslation } from 'react-i18next';
import AppModal from '../AppModal';

interface RopeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialValues?: RopeItem;
}

const RopeSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  diameter: Yup.number().transform((value, originalValue) => originalValue === '' ? null : value).typeError('Diameter must be a number').min(1).required('Diameter is required'),
  length: Yup.number().transform((value, originalValue) => originalValue === '' ? null : value).typeError('Length must be a number').min(1).required('Length is required'),
  unit: Yup.string().oneOf([Unit.Metres, Unit.Feet]).required('Unit is required'),
  notes: Yup.string(),
  isRetired: Yup.boolean(),
  manufacturer: Yup.string().nullable(),
  manufactureDate: Yup.date().nullable(),
  inServiceDate: Yup.date().nullable(),
  retirementDate: Yup.date().nullable(),
  serialNumber: Yup.string().nullable(),
  model: Yup.string().nullable(),
  weightGrams: Yup.number().nullable(),
  parentRopeItemsId: Yup.number().nullable(),
});

const RopeModal: React.FC<RopeModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  const isEditing = !!initialValues;
  const { t } = useTranslation();
  const [isAdvancedModeOpen, setIsAdvancedModeOpen] = useState(false);
  const mappedInitialValues = initialValues
    ? {
        name: initialValues.Name ?? '',
        diameter: initialValues.Diameter ?? '',
        length: initialValues.Length ?? '',
        unit: initialValues.Unit ?? Unit.Metres,
        isRetired: initialValues.IsRetired ?? false,
        manufacturer: initialValues.Manufacturer ?? '',
        manufactureDate: initialValues.ManufactureDate?.substring(0, 10) ?? '',
        inServiceDate: initialValues.InServiceDate?.substring(0, 10) ?? '',
        retirementDate: initialValues.RetirementDate?.substring(0, 10) ?? '',
        serialNumber: initialValues.SerialNumber ?? '',
        model: initialValues.Model ?? '',
        weightGrams: initialValues.WeightGrams ?? '',
        parentRopeItemsId: initialValues.ParentRopeItemsId ?? '',
        notes: initialValues.Notes ?? '',
      }
    : {
        name: '',
        diameter: '',
        length: '',
        unit: Unit.Metres,
        isRetired: false,
        manufacturer: '',
        manufactureDate: '',
        inServiceDate: '',
        retirementDate: '',
        serialNumber: '',
        identifier: '',
        lastInspectionDate: '',
        lastServicedDate: '',
        weightGrams: '',
        parentRopeItemsId: '',
        notes: ''
      };


  return (
    <AppModal open={open} onClose={onClose} title={isEditing ? t('settings.editRope') : t('gear.addRope')}>
      <Formik
        initialValues={mappedInitialValues}
        enableReinitialize
        validationSchema={RopeSchema}
        onSubmit={(values, { resetForm }) => {
          onSubmit({
            ...values,
            diameter: values.diameter === '' ? null : Number(values.diameter),
            length: values.length === '' ? null : Number(values.length),
            weightGrams: values.weightGrams === '' ? null : Number(values.weightGrams),
            parentRopeItemsId: values.parentRopeItemsId === '' ? null : Number(values.parentRopeItemsId),
          });
          onClose();
          resetForm();
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <FormikTextField<typeof values> label={t('common:fields.name')} name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} fullWidth required touched={touched} errors={errors} />
                <FormikTextField<typeof values> label={t('gear.manufacturer')} name="manufacturer" value={values.manufacturer} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} />
                <FormikTextField<typeof values> label={t('gear.model')} name="model" value={values.model} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} />
                <FormikTextField<typeof values> label={t('gear.inServiceDate')} name="inServiceDate" type="date" value={values.inServiceDate} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} InputLabelProps={{ shrink: true }} />
                <FormikTextField<typeof values> label={t('gear.diameter')} name="diameter" type="number" value={values.diameter} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} />
                <FormikTextField<typeof values> label={t('gear.length')} name="length" type="number" value={values.length} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} />
                {/* <FormikTextField<typeof values> select label={t('gear.unit')} name="unit" value={values.unit} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors}>
                  <MenuItem value={Unit.Metres}>{Unit.Metres}</MenuItem>
                  <MenuItem value={Unit.Feet}>{Unit.Feet}</MenuItem>
                </FormikTextField> */}
                <FormikTextField<typeof values> label={t('gear.weightGramsRope')} name="weightGrams" type="number" value={values.weightGrams} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} />
                <FormikTextField<typeof values> label={t('common:fields.notes')} name="notes" value={values.notes} onChange={handleChange} onBlur={handleBlur} fullWidth multiline minRows={2} touched={touched} errors={errors} />
                {isEditing && (
                  <FormControlLabel
                    control={<Checkbox checked={values.isRetired} name="isRetired" onChange={handleChange} />}
                    label={t('gear.isRetired')}
                  />
                )}
              </Box>
              <Divider sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <Button onClick={() => setIsAdvancedModeOpen(!isAdvancedModeOpen)}>{isAdvancedModeOpen ? t('gear.hideAdvancedMode') : t('gear.showAdvancedMode')}</Button>
              </Divider>
              {isAdvancedModeOpen && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
                  <FormikTextField<typeof values> label={t('gear.serialNumber')} name="serialNumber" value={values.serialNumber} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} />
                  <FormikTextField<typeof values> label={t('gear.manufactureDate')} name="manufactureDate" type="date" value={values.manufactureDate} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} InputLabelProps={{ shrink: true }} />
                  <FormikTextField<typeof values> label={t('gear.retirementDate')} name="retirementDate" type="date" value={values.retirementDate} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} InputLabelProps={{ shrink: true }} />
                </Box>  
                  
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>{t('common:actions.cancel')}</Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>{initialValues ? t('common:actions.save') : t('common:actions.add')}</Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </AppModal>
  );
};

export default RopeModal;

