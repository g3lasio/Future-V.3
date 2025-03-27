import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Button, Snackbar, Alert, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Título con efecto de gradiente
const GradientTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Quantico", sans-serif',
  fontWeight: 700,
  letterSpacing: '0.05em',
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: 'text',
  textFillColor: 'transparent',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(2),
}));

// Contenedor con efecto de aparición
const AnimatedContainer = styled(motion.div)({
  width: '100%',
});

// Variantes de animación para elementos
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Icono animado de éxito
const SuccessIcon = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  '& svg': {
    fontSize: '5rem',
    color: theme.palette.success.main
  }
}));

// Icono animado de error
const ErrorIconStyled = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  '& svg': {
    fontSize: '5rem',
    color: theme.palette.error.main
  }
}));

const SubscriptionResultPage = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // Obtener el ID de sesión de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          setStatus('error');
          setError('No se pudo verificar la suscripción. Parámetros faltantes.');
          return;
        }

        // Verificar el estado de la suscripción con el backend
        const response = await axios.get(`/api/subscriptions/verify-session?session_id=${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          setStatus('success');
          setSubscription(response.data.subscription);
          showAlert('¡Suscripción activada con éxito!', 'success');
        } else {
          setStatus('error');
          setError(response.data.message || 'Error al verificar la suscripción');
          showAlert(response.data.message || 'Error al verificar la suscripción', 'error');
        }
      } catch (err) {
        setStatus('error');
        const errorMessage = err.response?.data?.message || 'Error al verificar la suscripción';
        setError(errorMessage);
        showAlert(errorMessage, 'error');
      }
    };

    verifySubscription();
  }, []);

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleGoToSubscriptions = () => {
    window.location.href = '/subscription/plans';
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CircularProgress size={60} />
            </Box>
            <Typography variant="h6" align="center" gutterBottom>
              Verificando tu suscripción...
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary">
              Esto puede tomar unos momentos. Por favor, no cierres esta ventana.
            </Typography>
          </>
        );
      
      case 'success':
        return (
          <>
            <SuccessIcon
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircleIcon />
            </SuccessIcon>
            
            <Typography variant="h5" align="center" gutterBottom>
              ¡Suscripción Completada con Éxito!
            </Typography>
            
            <Typography variant="body1" align="center" color="textSecondary" paragraph>
              Tu suscripción al plan <strong>{subscription?.plan === 'premium' ? 'Premium' : 'Enterprise'}</strong> ha sido activada correctamente.
            </Typography>
            
            <Typography variant="body1" align="center" color="textSecondary" paragraph>
              Ciclo de facturación: <strong>{subscription?.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</strong>
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleGoToDashboard}
                sx={{ mx: 1 }}
              >
                Ir al Dashboard
              </Button>
            </Box>
          </>
        );
      
      case 'error':
        return (
          <>
            <ErrorIconStyled
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <ErrorIcon />
            </ErrorIconStyled>
            
            <Typography variant="h5" align="center" gutterBottom>
              Ha ocurrido un error
            </Typography>
            
            <Typography variant="body1" align="center" color="textSecondary" paragraph>
              {error || 'No se pudo completar la suscripción. Por favor, inténtalo de nuevo.'}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleGoToSubscriptions}
                sx={{ mx: 1 }}
              >
                Volver a Planes
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleGoToDashboard}
                sx={{ mx: 1 }}
              >
                Ir al Dashboard
              </Button>
            </Box>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <AnimatedContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 6
      }}>
        <Container maxWidth="md">
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <GradientTitle variant="h3" component="h1">
                FUTURELEX
              </GradientTitle>
            </Box>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Box 
              sx={{ 
                p: 4, 
                bgcolor: 'background.paper', 
                borderRadius: 2,
                boxShadow: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '3px',
                  background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }
              }}
            >
              {renderContent()}
            </Box>
          </motion.div>
        </Container>
      </Box>
      
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </AnimatedContainer>
  );
};

export default SubscriptionResultPage;
