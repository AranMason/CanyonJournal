import { Button, DialogActions, DialogContent, MenuItem, Typography } from "@mui/material";
import { Formik, Form } from "formik";
import AppModal from "../AppModal";
import FormikTextField from "../FormikTextField";
import { useTranslation } from "react-i18next";
import { ServiceType } from "../../types/types";
import { apiFetch } from "../../utils/api";
import * as EquipmentDataStore from "../../helpers/EquipmentDataStore";


type GearServiceModalProps = {
    open: boolean;
    gearId: number | null;
    onClose: () => void;
    initialValues?: any;
};

const GearServiceModal: React.FC<GearServiceModalProps> = ({ gearId, open, onClose, initialValues }) => {
    const { t } = useTranslation();

    return <AppModal open={gearId !== null && open} onClose={onClose} title={t('gear.serviceModal.title')}>        
        <Formik
            initialValues={{
                serviceType: initialValues?.serviceType ?? ServiceType.Service,
                serviceDate: initialValues?.serviceDate ?? new Date().toISOString().substring(0, 10),
                notes: initialValues?.notes ?? ''
            }}
            enableReinitialize
            onSubmit={async (values) => {
                apiFetch(`/api/equipment/gear/${gearId}/service`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        serviceType: values.serviceType,
                        serviceDate: values.serviceDate,
                        notes: values.notes
                    })
                });
                EquipmentDataStore.invalidate();
                onClose();
            }}
        >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                <Form>
                    <DialogContent>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 3 }}>
                            {t('gear.serviceModal.description')}
                        </Typography>
                        <FormikTextField<typeof values>
                            select
                            fullWidth
                            name="serviceType"
                            label={t('gear.serviceModal.serviceTypeLabel')}
                            value={values.serviceType}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            touched={touched}
                            errors={errors}
                        >
                            {[ServiceType.Service, ServiceType.Inspection, ServiceType.Other].map((type) => (
                                <MenuItem key={type} value={type}>
                                    {t('gear.serviceType', { context: type })}
                                </MenuItem>
                            ))}
                        </FormikTextField>

                        <FormikTextField<typeof values>
                            fullWidth
                            name="serviceDate"
                            label={t('gear.serviceModal.serviceDateLabel')}
                            type="date"
                            value={values.serviceDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            touched={touched}
                            errors={errors}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mt: 2 }}
                        />

                        <FormikTextField<typeof values>
                            fullWidth
                            name="notes"
                            label={t('common:fields.notes')}
                            value={values.notes}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            touched={touched}
                            errors={errors}
                            multiline
                            minRows={3}
                            sx={{ mt: 2 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} color="primary">
                            {t('common:actions.cancel')}
                        </Button>
                        <Button type="submit" color="primary" disabled={isSubmitting} variant="contained" sx={{ mr: 2 }}>
                            {t('common:actions.save')}
                        </Button>
                    </DialogActions>
                </Form>
            )}
        </Formik>
    </AppModal>;
}

export default GearServiceModal;