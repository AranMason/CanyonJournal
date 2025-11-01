import React from 'react';
import { styled, Theme, CSSObject, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    backgroundColor: theme.palette.primary.main,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

type SidebarDrawerProps = {
    children: (isOpen: boolean) => React.ReactNode
}

const SidebarDrawer: React.FC<SidebarDrawerProps> = ({children}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" open={isOpen}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle}>
            {!isOpen ? <ChevronRightIcon sx={{color: theme.palette.primary.contrastText}} /> : <ChevronLeftIcon sx={{color: theme.palette.primary.contrastText}} />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        {children(isOpen)}
      </Drawer>
    </Box>
  );
}

export default SidebarDrawer