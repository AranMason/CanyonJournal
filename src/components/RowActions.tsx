import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const RowActions: React.FC<RowActionsProps> = ({ onEdit, onDelete }) => (
  <>
    <Tooltip title="Edit">
      <IconButton size="small" onClick={onEdit} sx={{ color: 'grey.500' }}>
        <EditIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Delete">
      <IconButton size="small" onClick={onDelete} sx={{ color: 'grey.500' }}>
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  </>
);

export default RowActions;
