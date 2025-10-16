import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate, matchPath, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  label: string;
  icon: React.ReactNode;
  url?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, icon, url, onClick, disabled }) => {

  const navigate = useNavigate();
  const location = useLocation();

  var isMatch = url ? !!matchPath(url, location.pathname) : false;

  return <ListItem disablePadding>
    <ListItemButton
      selected={isMatch}
      onClick={() => {
        url && navigate(url);
        onClick && onClick();
      }} className="sidebar-hover" disabled={disabled}>
      <ListItemIcon sx={{ color: '#fff' }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  </ListItem>
};

export default SidebarItem;
