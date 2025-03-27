import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Button, Snackbar, Alert } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Cargar Stripe con la clave pública
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

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

const PaymentPage = ({ selectedPlan, billingCycle, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  useEffect(() => {
    // Si hay un sessionId, redirigir a Stripe Checkout
    const redirectToCheckout = async () => {
      if (sessionId) {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (error) {
          setError(error.message);
          showAlert(error.message, 'error');
        }
      }
    };

    redirectToCheckout();
  }, [sessionId]);

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Si es plan gratuito, procesar directamente
      if (selectedPlan === 'free') {
        const response = await axios.post('/api/subscriptions/subscribe', {
          planId: 'free'
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          showAlert('¡Suscripción al plan gratuito activada con éxito!', 'success');
          setTimeout(() => {
            onSuccess && onSuccess();
          }, 2000);
        }
      } else {
        // Para planes pagados, crear sesión de Stripe
        const response = await axios.post('/api/subscriptions/subscribe', {
          planId: selectedPlan,
          billingCycle
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          // Si hay URL directa, redirigir
          if (response.data.url) {
            window.location.href = response.data.url;
          } else {
            // Si no, usar redirectToCheckout
            setSessionId(response.data.sessionId);
          }
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al procesar el pago';
      setError(errorMessage);
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ 
        minHeight: '50vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}>
        <motion.div variants={itemVariants}>
          <GradientTitle variant="h4" component="h1">
            COMPLETAR SUSCRIPCIÓN
          </GradientTitle>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography variant="h6" gutterBottom align="center">
            Plan seleccionado: <strong>{selectedPlan === 'free' ? 'Gratuito' : selectedPlan === 'premium' ? 'Premium' : 'Enterprise'}</strong>
          </Typography>
          
          {selectedPlan !== 'free' && (
            <Typography variant="body1" gutterBottom align="center">
              Ciclo de facturación: <strong>{billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</strong>
            </Typography>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              color={selectedPlan === 'premium' ? 'primary' : selectedPlan === 'enterprise' ? 'secondary' : 'primary'}
              size="large"
              onClick={handlePayment}
              disabled={loading}
              sx={{ 
                py: 1.5,
                px: 4,
                fontWeight: 600,
                letterSpacing: '0.5px',
                minWidth: '200px'
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                selectedPlan === 'free' ? 'Activar Plan Gratuito' : 'Proceder al Pago'
              )}
            </Button>

            <Button
              variant="text"
              color="inherit"
              onClick={onCancel}
              sx={{ ml: 2 }}
              disabled={loading}
            >
              Cancelar
            </Button>
          </Box>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              {selectedPlan === 'free' 
                ? 'El plan gratuito te permite acceder a funcionalidades básicas sin costo.' 
                : 'Tu pago será procesado de forma segura a través de Stripe. No almacenamos tu información de pago.'}
            </Typography>
          </Box>
        </motion.div>

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
      </Box>
    </AnimatedContainer>
  );
};

export default PaymentPage;
