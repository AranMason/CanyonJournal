import React, { useEffect, useState } from 'react'
import { GearItem, GearItemSet } from '../../types/types';
import { Button, DialogActions, DialogContent, TextField } from '@mui/material';
import Loader from '../Loader';
import { useTranslation } from 'react-i18next';
import AppModal from '../AppModal';
import { load as loadGear } from '../../helpers/EquipmentDataStore';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import GearSetItemSelector from './GearSetItemSelector';

interface IGearSetModalProps {
    isOpen: boolean;
    gearSet: GearItemSet | null
    onSave: (set: GearItemSet) => Promise<void>
    onClose: () => void;
    actionLabel?: string;
}

const defaultGearSet: GearItemSet = {
    Id: 0,
    Name: '',
    Items: []
}

const GearSetModal: React.FC<IGearSetModalProps> = ({ isOpen, gearSet, actionLabel, onSave, onClose }) => {
    const { t } = useTranslation('translation')
    const [gear, setGear] = useState<GearItem[]>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);

        loadGear().then(g => {
            setGear(g.gear);
        }).finally(() => setIsLoading(false));
    }, [])

    return <AppModal open={isOpen} onClose={onClose} title={t('gear.gearSet.modalTitle', { context: !!gearSet ? 'edit' : 'create' })}>
        <Formik
            initialValues={gearSet ?? defaultGearSet}
            enableReinitialize
            validationSchema={Yup.object({
                Name: Yup.string().required(t('gear.gearSet.modalErrors.name')),
                Items: Yup
                    .array()
                    .of(Yup.number().required())
                    .min(1, t('gear.gearSet.modalErrors.selectedGear'))
            })} onSubmit={
                async (value, { setSubmitting }) => {
                    setSubmitting(true)
                    await onSave({
                        ...value,
                        Id: gearSet?.Id ?? value.Id
                    }).finally(() => {
                        setSubmitting(false);
                    })
                }
            }>
            {({ values, isValid, handleBlur, handleChange, handleSubmit, touched, errors, submitCount, setFieldTouched, setFieldValue }) => <>
                <DialogContent>
                    <Loader isLoading={isLoading}>
                        <Form>
                            <TextField
                                label={t('common:fields.name')}
                                name="Name"
                                value={values.Name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                fullWidth
                                error={touched.Name && Boolean(errors.Name)}
                                helperText={touched.Name && errors.Name}
                                sx={{ mb: 2 }}
                            />

                            {(touched.Items || submitCount > 0) && errors.Items && <TextField
                                value={errors.Items}
                                error
                                fullWidth
                                margin="normal"
                                helperText={errors.Items}
                                label={t('gear.gearSet.selectedGear')}
                                sx={{ display: 'none' }}
                            />}
                            {gear && (
                                <GearSetItemSelector
                                    gear={gear}
                                    value={values.Items}
                                    onChange={(items) => {
                                        setFieldTouched('Items', true);
                                        setFieldValue('Items', items);
                                    }}
                                />
                            )}
                        </Form>

                    </Loader>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isLoading}>{t('common:actions.cancel')}</Button>
                    <Button onClick={() => handleSubmit()} disabled={isLoading || !isValid} variant='contained'>{actionLabel ?? t('common:actions.save')}</Button>
                </DialogActions>
            </>}
        </Formik>
    </AppModal >

}

export default GearSetModal