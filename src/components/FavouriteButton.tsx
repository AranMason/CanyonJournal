import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useTranslation } from 'react-i18next';

interface FavouriteButtonProps {
  isFavourite: boolean;
  onToggle: () => void;
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({ isFavourite, onToggle }) => {
  const { t } = useTranslation('common');
  return (
    <Tooltip title={isFavourite ? t('actions.removeFavourite') : t('actions.addFavourite')}>
      <IconButton onClick={onToggle} color="error" size="small" sx={{ p: 0.25 }}>
        {isFavourite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};

export default FavouriteButton;
