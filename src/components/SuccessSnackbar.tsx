import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface SuccessSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

const SuccessSnackbar: React.FC<SuccessSnackbarProps> = ({ open, message, onClose, duration = 3000 }) => (
  <Snackbar open={open} autoHideDuration={duration} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
    <Alert onClose={onClose} severity="success" sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
);

export default SuccessSnackbar;
