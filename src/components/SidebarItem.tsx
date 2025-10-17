import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

interface SidebarItemProps {
  isOpen: boolean;
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
    color: theme.palette.secondary.main
  },
  "&.Mui-selected": {
    backgroundColor: `color-mix(in oklab, ${theme.palette.primary.main}, white 20%)`,
  }
}));

const SidebarIcon = styled(ListItemIcon)(() => ({
  color: 'inherit',
  minWidth: 0,
  justifyContent: 'center',
}));

const SidebarItem: React.FC<SidebarItemProps> = ({ isOpen, label, icon, url, onClick, disabled }) => {

  const location = useLocation();
  const navigate = useNavigate();

  var isMatch = url ? !!matchPath(url, location.pathname) : false;

  return <ListItem key={label} disablePadding sx={{ display: 'block' }} >
    <StyledListItemButton
      selected={isMatch}
      disabled={disabled}
      onClick={() => {
        url && navigate(url);
        onClick && onClick();
      }}
      sx={[
        {
          minHeight: 48,
          px: 2.5,
        },
        isOpen
          ? {
            justifyContent: 'initial',
          }
          : {
            justifyContent: 'center',
          },
      ]}
    >
      <SidebarIcon
        sx={[
          isOpen
            ? {
              mr: 3,
            }
            : {
              mr: 'auto',
            },
        ]}
      >
        {icon}
      </SidebarIcon>
      <ListItemText
        primary={label}
        color='#fff'
        sx={[
          isOpen
            ? {
              opacity: 1,
            }
            : {
              opacity: 0,
            },
        ]}
      />
    </StyledListItemButton>
  </ListItem>
};

export default SidebarItem;
