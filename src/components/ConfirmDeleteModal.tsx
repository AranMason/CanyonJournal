import React from 'react';
import { Button, DialogContent, DialogContentText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AppModal from './AppModal';

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ open, title, message, onConfirm, onCancel }) => {
  const { t } = useTranslation('common');
  return (
    <AppModal
      open={open}
      onClose={onCancel}
      title={title}
      maxWidth="xs"
      actions={
        <>
          <Button onClick={onCancel}>{t('actions.cancel')}</Button>
          <Button onClick={onConfirm} color="error" variant="contained">{t('actions.delete')}</Button>
        </>
      }
    >
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
    </AppModal>
  );
};

export default ConfirmDeleteModal;
