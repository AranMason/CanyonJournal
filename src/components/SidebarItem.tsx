import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, styled, useTheme } from '@mui/material';
import { useNavigate, matchPath, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  label: string;
  icon: React.ReactNode;
  url?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  backgroundColor: "transparent",
  color: theme.palette.secondary.contrastText,
  
  padding: theme.spacing(2),
  ":hover": {
    backgroundColor: `color-mix(in oklab, ${theme.palette.primary.main}, white 20%)`,
    opacity: 0.8
  },
  "&.Mui-selected": {
    backgroundColor: `color-mix(in oklab, ${theme.palette.primary.main}, white 20%)`,
    opacity: 0.8
  }
}));

const SidebarItem: React.FC<SidebarItemProps> = ({ label, icon, url, onClick, disabled }) => {

  const navigate = useNavigate();
  const location = useLocation();

  var isMatch = url ? !!matchPath(url, location.pathname) : false;

  return <ListItem disablePadding>
    <StyledListItemButton
      selected={isMatch}
      onClick={() => {
        url && navigate(url);
        onClick && onClick();
      }} disabled={disabled}>
      <ListItemIcon sx={{ color: '#fff' }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </StyledListItemButton>
  </ListItem>
};

export default SidebarItem;
