import React from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Link, MenuItem, Select, TextField, Typography,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../utils/api';
import { ReportIssueType, ReportIssueTypeList } from '../types/ReportIssueType';
import { GetReportIssueTypeDisplayName } from '../helpers/EnumMapper';

interface ReportIssueModalProps {
  canyonId: number;
  canyonName: string;
  canyonUrl?: string | null;
  sourceName?: string | null;
  open: boolean;
  onClose: () => void;
}

interface ReportFormValues {
  issueType: ReportIssueType | '';
  description: string;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ canyonId, canyonName, canyonUrl, sourceName, open, onClose }) => {
  const { t } = useTranslation();

  const initialValues: ReportFormValues = {
    issueType: '',
    description: '',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('report.title')}</DialogTitle>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={Yup.object({
          issueType: Yup.number().required(t('report.issueType') + ' is required'),
          description: Yup.string().when('issueType', {
            is: ReportIssueType.Other,
            then: schema => schema.required(t('report.descriptionRequired')),
            otherwise: schema => schema.optional(),
          }),
        })}
        onSubmit={async (values, { setSubmitting, setStatus, resetForm }) => {
          setStatus(undefined);
          try {
            await apiFetch('/api/reports', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ canyonId, issueType: values.issueType, description: values.description }),
            });
            resetForm();
            onClose();
          } catch (err: any) {
            setStatus({ error: err.message || t('errors.failedToSave') });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, status }) => (
          <Form>
            <DialogContent>
              <Alert severity="info" sx={{ mb: 2 }}>

                {t('report.scope')}

                {canyonUrl && (
                  <>
                    <br />
                    <Link href={canyonUrl} target="_blank" rel="noopener noreferrer">
                      {sourceName || t('report.sourceLink')}
                    </Link>
                  </>
                )}
              </Alert>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {t('report.subtitle', { name: canyonName })}
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="issue-type-label">{t('report.issueType')}</InputLabel>
                <Select
                  labelId="issue-type-label"
                  label={t('report.issueType')}
                  value={values.issueType}
                  onChange={e => setFieldValue('issueType', e.target.value)}
                  error={touched.issueType && Boolean(errors.issueType)}
                >
                  {ReportIssueTypeList.map(type => (
                    <MenuItem key={type} value={type}>{GetReportIssueTypeDisplayName(type)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={values.issueType === ReportIssueType.Other
                  ? t('report.description')
                  : t('report.descriptionOptional')}
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                multiline
                minRows={3}
                placeholder={t('report.descriptionHint')}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
              {status?.error && <Typography color="error" mt={1}>{status.error}</Typography>}
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={isSubmitting}>{t('common:actions.cancel')}</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {t('report.submit')}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ReportIssueModal;
