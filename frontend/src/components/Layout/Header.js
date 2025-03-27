import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { motion } from 'framer-motion';

// Logo animado con efecto de brillo
const Logo = styled(Typography)(({ theme }) => ({
  fontFamily: '"Orbitron", sans-serif',
  fontWeight: 700,
  letterSpacing: '0.1em',
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
  backgroundSize: '200% auto',
  color: 'transparent',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  animation: 'shine 3s linear infinite',
  '@keyframes shine': {
    to: {
      backgroundPosition: '200% center',
    },
  },
}));

// Botón de navegación con efecto de brillo al pasar el mouse
const NavButton = styled(Button)(({ theme, active }) => ({
  margin: theme.spacing(0, 1),
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: active ? '100%' : '0%',
    height: '2px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    transition: 'all 0.3s ease',
    transform: 'translateX(-50%)',
  },
  '&:hover::after': {
    width: '100%',
  },
}));

// Barra lateral con efecto de borde brillante
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: 240,
    boxSizing: 'border-box',
    borderRight: 'none',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '1px',
      background: `linear-gradient(to bottom, transparent, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, transparent)`,
    },
  },
}));

// Elemento de lista con efecto de hover
const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: active ? 'rgba(0, 188, 212, 0.1)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(0, 188, 212, 0.05)',
  },
  '& .MuiListItemIcon-root': {
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
  },
  '& .MuiListItemText-primary': {
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
  },
}));

const Header = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { text: 'Mis Documentos', icon: <DescriptionIcon />, path: '/documents' },
    { text: 'Generar Documento', icon: <AddIcon />, path: '/generator' },
    { text: 'Analizar Documento', icon: <AnalyticsIcon />, path: '/analyzer' },
    { text: 'Editar Documento', icon: <EditIcon />, path: '/editor' },
    { text: 'Mi Perfil', icon: <AccountCircleIcon />, path: '/profile' },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Logo variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none' }}>
          FUTURELEX
        </Logo>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <StyledListItem
            key={item.text}
            active={isActive(item.path)}
            component={RouterLink}
            to={item.path}
            button
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </StyledListItem>
        ))}
      </List>
      <Divider />
      <List>
        <StyledListItem button>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </StyledListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        component={motion.div}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Logo variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', flexGrow: isMobile ? 1 : 0 }}>
            FUTURELEX
          </Logo>
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              {navItems.map((item) => (
                <NavButton
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  active={isActive(item.path) ? 1 : 0}
                  startIcon={item.icon}
                >
                  {item.text}
                </NavButton>
              ))}
            </Box>
          )}
          {!isMobile && (
            <Button 
              color="secondary" 
              variant="outlined"
              startIcon={<LogoutIcon />}
            >
              Cerrar Sesión
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <StyledDrawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Mejor rendimiento en dispositivos móviles
          }}
          sx={{
            display: { xs: 'block', md: isMobile ? 'block' : 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </StyledDrawer>
      </Box>
    </>
  );
};

export default Header;
