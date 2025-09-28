import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

interface SidebarItemProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, icon, onClick, disabled }) => (
  <ListItem disablePadding>
    <ListItemButton onClick={onClick} className="sidebar-hover" disabled={disabled}>
      <ListItemIcon sx={{ color: '#fff' }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  </ListItem>
);

export default SidebarItem;
