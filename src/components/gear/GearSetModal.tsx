import React, { useEffect, useState } from 'react'
import { GearItem, GearItemSet } from '../../types/types';
import { Button, DialogActions, DialogContent, List, ListItem, ListItemText, ListSubheader, Switch, TextField, Typography } from '@mui/material';
import Loader from '../Loader';
import { useTranslation } from 'react-i18next';
import AppModal from '../AppModal';
import { load as loadGear } from '../../helpers/EquipmentDataStore';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

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
    const [gearSetData, setGearSetData] = useState(defaultGearSet);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);

        loadGear().then(g => {
            setGear(g.gear);
        }).finally(() => setIsLoading(false));
    }, [])

    useEffect(() => {
        if (gearSet) setGearSetData(gearSet)
    }, [gearSet]);

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
                        Id: gearSetData.Id
                    }).finally(() => {
                        setSubmitting(false);
                    })
                }
            }>
            {({ values, setFieldValue, isValid, handleBlur, handleChange, handleSubmit, touched, errors, submitCount, setFieldTouched }) => <>
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
                            />
                            <List dense>
                                {(touched.Items || submitCount > 0) && errors.Items && <Typography variant='caption' color='error'>{errors.Items}</Typography>}
                                {Object.entries(gear?.reduce((acc, item) => {
                                    acc[item.Category] ||= [];
                                    acc[item.Category].push(item);
                                    return acc;
                                }, {} as { [key in string]: GearItem[] }) ?? []).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]): React.ReactNode => {
                                    return <React.Fragment key={category}>
                                        <ListSubheader disableSticky>{category}</ListSubheader>
                                        {(items as GearItem[]).map(g => {
                                            const isChecked = values.Items.includes(g.Id);

                                            return <ListItem
                                                key={g.Id}
                                                secondaryAction={<Switch checked={isChecked} value={g.Id} onClick={() => {
                                                    setFieldTouched('Items', true);
                                                    if (isChecked) {
                                                        setFieldValue(
                                                            'Items',
                                                            values.Items.filter(s => s !== g.Id)
                                                        )
                                                    } else {
                                                        setFieldValue(
                                                            'Items',
                                                            [...values.Items, g.Id]
                                                        )
                                                    }
                                                }} />}>
                                                <ListItemText inset primary={g.Name} secondary={t('gear.makeAndModel', { make: g.Manufacturer, model: g.Model })}></ListItemText>

                                            </ListItem>
                                        })}</React.Fragment>;
                                })}

                            </List>
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