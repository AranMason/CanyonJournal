import React from 'react';
import { useUser } from '../App';
import { List, Box,  Divider } from '@mui/material';
import SidebarItem from './SidebarItem';
import HomeIcon from '@mui/icons-material/Home';
import AddRecordIcon from '@mui/icons-material/Create';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import JournalIcon from '@mui/icons-material/AutoStories';
import LogoutIcon from '@mui/icons-material/Logout';
import SidebarDrawer from './SidebarDrawer';
import LoginIcon from '@mui/icons-material/Login';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import SettingsIcon from '@mui/icons-material/Settings';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useTranslation } from 'react-i18next';
import ChecklistIcon from '@mui/icons-material/Checklist';
import BuildIcon from '@mui/icons-material/Build';

const Sidebar: React.FC<{ mobileOpen?: boolean; onMobileClose?: () => void }> = ({ mobileOpen, onMobileClose }) => {
  const { user, setUser, loading } = useUser();
  const { t } = useTranslation();

  if (loading) return null;

  const handleBugReport = () => {
    const subject = encodeURIComponent(`Bug Report – ${t('common:app.name')}`);
    const body = encodeURIComponent(
      `Please describe the issue below:\n\n\n\n---\nPage: ${window.location.href}\nUser ID: ${user?.id ?? 'unknown'}`
    );
    window.open(`mailto:hello@handlinne.co.uk?subject=${subject}&body=${body}`);
  };

  return <SidebarDrawer mobileOpen={mobileOpen} onMobileClose={onMobileClose}>{(isOpen) => <><Box>
    <List>
      <SidebarItem
        isOpen={isOpen}
        label={t('nav.dashboard')}
        icon={<HomeIcon />}
        url='/dashboard'
        disabled={!user}
        onClose={onMobileClose}
      />
      <SidebarItem
        isOpen={isOpen}
        label={t('nav.journal')}
        icon={<JournalIcon />}
        url='/journal'
        disabled={!user}
        onClose={onMobileClose}
      />
      <SidebarItem
        isOpen={isOpen}
        label={t('common:actions.recordDescent')}
        icon={<AddRecordIcon />}
        url='/journal/record'
        disabled={!user}
        onClose={onMobileClose}
      />
      <Divider sx={{ my: 2, borderColor: "white", opacity: 0.15 }}></Divider>
      <SidebarItem
        isOpen={isOpen}
        label={t('nav.canyons')}
        icon={<LocationPinIcon />}
        url='/canyons'
        disabled={!user}
        onClose={onMobileClose}
      />
      <SidebarItem
        isOpen={isOpen}
        label={t('nav.goals')}
        icon={<ChecklistIcon />}
        url='/settings?tab=0'
        disabled={!user}
        onClose={onMobileClose}
      />
      <SidebarItem
        isOpen={isOpen}
        label={t('nav.gear')}
        icon={<BuildIcon />}
        url='/settings?tab=2'
        disabled={!user}
        onClose={onMobileClose}
      />
      <Divider sx={{ my: 2, borderColor: "white", opacity: 0.15 }}></Divider>
      <SidebarItem
        isOpen={isOpen}
        label={t('nav.settings')}
        icon={<SettingsIcon />}
        url='/settings'
        disabled={!user}
        onClose={onMobileClose}
      />
      {user && user.isAdmin && <SidebarItem
      isOpen={isOpen}
        label={t('nav.admin')}
        icon={<AdminPanelSettingsIcon />}
        url='/admin'
        onClose={onMobileClose}
      />}
    </List>
  </Box>    
    <Box sx={{ py: 2, marginTop: "auto" }}>
      <List>
        <SidebarItem
          isOpen={isOpen}
          label="Report a Bug"
          icon={<BugReportIcon />}
          onClick={handleBugReport}
          onClose={onMobileClose}
        />
        {user  && <SidebarItem
          isOpen={isOpen}
          label="Logout"
          icon={<LogoutIcon />}
          onClick={() => {
            setUser(null);
            window.location.href = '/logout';
          }}
          onClose={onMobileClose}
        />}
        {!user  && <SidebarItem
          isOpen={isOpen}
          label="Login"
          icon={<LoginIcon />}
          onClick={() => {
            window.location.href = '/login';
          }}
          onClose={onMobileClose}
        />}
      </List>
    </Box>
  </>}

  </SidebarDrawer>


};

export default Sidebar;

