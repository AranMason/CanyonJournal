import React, { useEffect, useState } from 'react';
import { DialogContent, DialogActions, Button, Box, Divider, Checkbox, FormControlLabel, Autocomplete, TextField } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { GearItem } from '../../types/types';
import FormikTextField from '../FormikTextField';
import { useTranslation } from 'react-i18next';
import AppModal from '../AppModal';
import {load as loadEquipment} from '../../helpers/EquipmentDataStore';

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
  isRetired: Yup.boolean(),
  manufacturer: Yup.string().nullable(),
  manufactureDate: Yup.date().nullable(),
  inServiceDate: Yup.date().nullable(),
  retirementDate: Yup.date().nullable(),
  serialNumber: Yup.string().nullable(),
  model: Yup.string().nullable(),
  lastInspectionDate: Yup.date().nullable(),
  weightGrams: Yup.number().nullable(),
});

const GearModal: React.FC<GearModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  const { t } = useTranslation();
  const [isAdvancedModeOpen, setIsAdvancedModeOpen] = useState(false);
  const [gearCategories, setGearCategories] = useState<string[]>([]);

  useEffect(() => {

    loadEquipment().then(equipment => {
      const categories = Array.from(new Set(equipment.gear.map(g => g.Category).filter(c => c)));
      setGearCategories(categories.sort((a, b) => a.localeCompare(b)));
    })

  }, [t]);

  const mappedInitialValues = {
    name: initialValues?.Name ?? '',
    category: initialValues?.Category ?? '',
    notes: initialValues?.Notes ?? '',
    isRetired: initialValues?.IsRetired ?? false,
    manufacturer: initialValues?.Manufacturer ?? '',
    manufactureDate: initialValues?.ManufactureDate?.substring(0, 10) ?? '',
    inServiceDate: initialValues?.InServiceDate?.substring(0, 10) ?? '',
    retirementDate: initialValues?.RetirementDate?.substring(0, 10) ?? '',
    serialNumber: initialValues?.SerialNumber ?? '',
    model: initialValues?.Model ?? '',
    weightGrams: initialValues?.WeightGrams ?? '',
  }

  return (
    <AppModal open={open} onClose={onClose} title={initialValues ? t('settings.editGear') : t('gear.addGear')}>
      <Formik
        initialValues={mappedInitialValues}
        enableReinitialize
        validationSchema={GearSchema}
        onSubmit={(values, { resetForm }) => {
          onSubmit({
            ...values,
            weightGrams: values.weightGrams === '' ? null : Number(values.weightGrams),
          });
          resetForm();
          onClose();
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue, setFieldTouched }) => (
          <Form>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <FormikTextField<typeof values> label={t('common:fields.name')} name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} fullWidth required touched={touched} errors={errors} />

                  <Autocomplete
                    id="category-autocomplete"
                    options={gearCategories} // Replace with your actual array of options (e.g., ['Tent', 'Backpack'])
                    value={values.category || null} // Formik value (fallback to null so MUI doesn't complain about uncontrolled/controlled switching)
                    freeSolo // Allow users to enter values not in the list
                
                    onInputChange={(event, newValue) => {
                      // Manually update Formik's state when a user selects an option
                      setFieldValue('category', newValue);
                    }}
                    onBlur={() => {
                      // Manually mark the field as touched when the user leaves the component
                      setFieldTouched('category', true);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('gear.category')}
                        name="category"
                        fullWidth
                        required
                        // Connect Formik's error states directly to the input
                        error={Boolean(touched.category && errors.category)}
                        helperText={touched.category && errors.category}
                      />
                    )}
                  />
                
                <FormikTextField<typeof values> label={t('gear.manufacturer')} name="manufacturer" value={values.manufacturer} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} />
                <FormikTextField<typeof values> label={t('gear.model')} name="model" value={values.model} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} />
                <FormikTextField<typeof values> label={t('gear.inServiceDate')} name="inServiceDate" type="date" value={values.inServiceDate} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} InputLabelProps={{ shrink: true }} />
                <FormikTextField<typeof values> label={t('gear.weightGrams')} name="weightGrams" type="number" value={values.weightGrams} onChange={handleChange} onBlur={handleBlur} fullWidth touched={touched} errors={errors} />
                <FormikTextField<typeof values> label={t('common:fields.notes')} name="notes" value={values.notes} onChange={handleChange} onBlur={handleBlur} fullWidth multiline minRows={2} touched={touched} errors={errors} />
                {initialValues && (
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

export default GearModal;

