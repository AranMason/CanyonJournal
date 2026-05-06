import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';

interface RowActionsProps {
  onEdit?: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onViewTrips?: () => void;
}

const RowActions: React.FC<RowActionsProps> = ({ onEdit, onDelete, onViewTrips }) => (
  <>
    {onViewTrips && <Tooltip title="View Trips">
      <IconButton size="small" onClick={onViewTrips} sx={{ color: 'grey.500' }}>
        <HistoryIcon />
      </IconButton>
    </Tooltip>}
    {onEdit && <Tooltip title="Edit">
      <IconButton size="small" onClick={onEdit} sx={{ color: 'grey.500' }}>
        <EditIcon />
      </IconButton>
    </Tooltip>}
    {onDelete &&<Tooltip title="Delete">
      <IconButton size="small" onClick={onDelete} sx={{ color: 'grey.500' }}>
        <DeleteIcon />
      </IconButton>
    </Tooltip>}
  </>
);

export default RowActions;
