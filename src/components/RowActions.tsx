import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import { useTranslation } from 'react-i18next';

interface RowActionsProps {
  onEdit?: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onViewTrips?: () => void;
  onService?: () => Promise<void> | void;
}

const RowActions: React.FC<RowActionsProps> = ({ onEdit, onDelete, onViewTrips, onService }) => {
  const { t } = useTranslation('common');
  return (
    <>
      {onViewTrips && <Tooltip title={t('actions.viewTrips')}>
        <IconButton size="small" onClick={onViewTrips} sx={{ color: 'grey.500' }}>
          <HistoryIcon />
        </IconButton>
      </Tooltip>}
      {onService && <Tooltip title={t('actions.service')}>
        <IconButton size="small" onClick={onService} sx={{ color: 'grey.500' }}>
          <HistoryIcon />
        </IconButton>
      </Tooltip>}
      {onEdit && <Tooltip title={t('actions.edit')}>
        <IconButton size="small" onClick={onEdit} sx={{ color: 'grey.500' }}>
          <EditIcon />
        </IconButton>
      </Tooltip>}
      {onDelete && <Tooltip title={t('actions.delete')}>
        <IconButton size="small" onClick={onDelete} sx={{ color: 'grey.500' }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>}
    </>
  );
};

export default RowActions;
