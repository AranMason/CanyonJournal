import React from 'react';
import { Dialog, DialogTitle, DialogActions, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DialogProps } from '@mui/material/Dialog';

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Rendered inside a DialogActions footer. For Formik form modals, include DialogActions inside children instead. */
  actions?: React.ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  fullWidth?: boolean;
  /** Disables the X button and backdrop close — use while saving or submitting. */
  disableClose?: boolean;
}

const AppModal: React.FC<AppModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  disableClose = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={disableClose ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      slotProps={{
        paper: { sx: { borderLeft: '4px solid', borderColor: 'secondary.main', pb: 1, borderRadius: '0 4px 4px 0', minHeight: '400px' } },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        {title}
        <IconButton
          size="small"
          onClick={onClose}
          disabled={disableClose}
          aria-label="close"
          sx={{ ml: 1, flexShrink: 0 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      {children}
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};

export default AppModal;
