import { createTheme } from '@mui/material/styles';

// Tema futurista con fondo negro para FutureLex
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bcd4', // Cian futurista
      light: '#33c9dc',
      dark: '#008394',
      contrastText: '#000',
    },
    secondary: {
      main: '#7c4dff', // Púrpura futurista
      light: '#9670ff',
      dark: '#5035b1',
      contrastText: '#fff',
    },
    background: {
      default: '#0a0a0a', // Negro casi puro
      paper: '#121212', // Negro con ligero tinte
      accent: '#1a1a1a', // Negro más claro para acentos
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
      hint: 'rgba(255, 255, 255, 0.5)',
    },
    error: {
      main: '#ff5252',
    },
    warning: {
      main: '#ffab40',
    },
    info: {
      main: '#40c4ff',
    },
    success: {
      main: '#69f0ae',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Quantico", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h2: {
      fontFamily: '"Quantico", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h3: {
      fontFamily: '"Quantico", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.04em',
    },
    h4: {
      fontFamily: '"Quantico", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.03em',
    },
    h5: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    h6: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#2b2b2b",
            width: '8px',
            height: '8px',
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b6b6b",
            minHeight: 24,
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#959595",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, rgba(10,10,10,0.9) 0%, rgba(18,18,18,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 188, 212, 0.15)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          textTransform: 'uppercase',
          fontWeight: 600,
          padding: '10px 20px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'all 0.5s',
          },
          '&:hover::before': {
            left: '100%',
          },
        },
        contained: {
          boxShadow: '0 4px 10px rgba(0, 188, 212, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 15px rgba(0, 188, 212, 0.4)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, rgba(18,18,18,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, #00bcd4, #7c4dff)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.15)',
              transition: 'all 0.3s',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 188, 212, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00bcd4',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(145deg, rgba(18,18,18,0.95) 0%, rgba(26,26,26,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(18,18,18,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(0, 188, 212, 0.15)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'rgba(18, 18, 18, 0.95)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

export default theme;
