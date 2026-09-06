import React, { useEffect, useState } from 'react';
import { Alert, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Canyon, CanyonSource } from '../../types/Canyon';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../utils/api';

interface ReportCTAAlertProps {
  canyon: Canyon;
  onClose: () => void;
}

const ReportAlert: React.FC<{ canyon: Canyon; onClose: () => void, source: CanyonSource, reportUrl: string | null }> = ({ canyon, onClose, source, reportUrl }) => {
  const { t } = useTranslation();
  return (
    <Alert
      severity="success"
      sx={{ mb: 2, alignItems: 'center', py: 2, px: 3 }}
      icon={source?.LogoUrl && <img src={source.LogoUrl} alt={source?.DisplayName} style={{ height: 20, width: 20, objectFit: 'contain' }} />}
      onClose={onClose}
      action={
        reportUrl && (
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
        )
      }
    >
      {t('journal.sourceCta', { name: canyon.Name, sourceName: source?.DisplayName })}
    </Alert>
  );
};

const ReportCTAAlert: React.FC<ReportCTAAlertProps> = ({ canyon, onClose }) => {

  const [isLoading, setIsLoading] = useState(false);
  const [sourceInfo, setSources] = useState<{ [id: number]: CanyonSource }>({});

  useEffect(() => {
    setIsLoading(true);
    apiFetch<CanyonSource[]>('/api/sources').then((s) => {

      const val: { [id: number]: CanyonSource } = {};

      s.forEach(source => {
        val[source.Id] = source
      });

      setSources(val);

    }).finally(() => setIsLoading(false));
  }, [canyon])

  if (isLoading || !canyon) return null;

  switch (canyon.SourceId) {
    case 2:
      return <ReportAlert canyon={canyon} onClose={onClose} source={sourceInfo[2]} reportUrl={canyon.Url ? `${canyon.Url}#comments` : (sourceInfo[2].WebsiteUrl ?? null)} />;
    case 3:
      return <ReportAlert canyon={canyon} onClose={onClose} source={sourceInfo[3]} reportUrl={canyon.Url} />;
    default:
      return null;
  }
};

export default ReportCTAAlert;

