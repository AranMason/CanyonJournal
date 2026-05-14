import React from 'react';
import { Alert, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CanyonListEntry } from '../types/Canyon';
import { useTranslation } from 'react-i18next';

interface ReportCTAAlertProps {
  canyon: CanyonListEntry;
  onClose: () => void;
}

const CanyonLogReportAlert: React.FC<{ canyon: CanyonListEntry; onClose: () => void }> = ({ canyon, onClose }) => {
  const { t } = useTranslation();
  const reportUrl = `${canyon.Url}#comments`;
  return (
    <Alert
      severity="success"
      sx={{ mb: 2, alignItems: 'center', py: 2, px: 3 }}
      icon={<img src="/images/canyonlog/icon.png" alt={t('common:partners.canyonLog')} style={{ height: 20, width: 20, objectFit: 'contain' }} />}
      onClose={onClose}
      action={
        <Button
          variant="outlined"
          size="small"
          sx={{ bgcolor: 'white', whiteSpace: 'nowrap' }}
          href={reportUrl}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon fontSize="small" />}
        >
          {t('common:actions.postReport')}
        </Button>
      }
    >
      {t('journal.canyonLogCta', { name: canyon.Name })}
    </Alert>
  );
};

const ReportCTAAlert: React.FC<ReportCTAAlertProps> = ({ canyon, onClose }) => {
  switch (canyon.SourceId) {
    case 2:
      return <CanyonLogReportAlert canyon={canyon} onClose={onClose} />;
    default:
      return null;
  }
};

export default ReportCTAAlert;

