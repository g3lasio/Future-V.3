import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Grid, Divider, Link, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Papel con efecto de borde brillante
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'linear-gradient(145deg, rgba(18,18,18,0.9) 0%, rgba(26,26,26,0.9) 100%)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

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

// Tarjeta de plan
const PlanCard = styled(Paper)(({ theme, isSelected, isPremium, isEnterprise }) => {
  let gradientColors = 'rgba(30,30,30,0.9), rgba(40,40,40,0.9)';
  
  if (isPremium) {
    gradientColors = 'rgba(0,150,136,0.1), rgba(0,150,136,0.05)';
  } else if (isEnterprise) {
    gradientColors = 'rgba(124,77,255,0.1), rgba(124,77,255,0.05)';
  }
  
  return {
    padding: theme.spacing(3),
    background: `linear-gradient(145deg, ${gradientColors})`,
    backdropFilter: 'blur(10px)',
    border: isSelected 
      ? `2px solid ${isPremium ? theme.palette.primary.main : isEnterprise ? theme.palette.secondary.main : theme.palette.grey[400]}`
      : '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
    boxShadow: isSelected 
      ? `0 10px 25px ${isPremium ? 'rgba(0,150,136,0.3)' : isEnterprise ? 'rgba(124,77,255,0.3)' : 'rgba(0,0,0,0.3)'}`
      : '0 5px 15px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      transform: 'scale(1.03)',
      boxShadow: `0 10px 25px ${isPremium ? 'rgba(0,150,136,0.3)' : isEnterprise ? 'rgba(124,77,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
    }
  };
});

// Etiqueta de característica
const FeatureLabel = styled(Box)(({ theme, isIncluded }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  color: isIncluded ? theme.palette.text.primary : theme.palette.text.disabled,
  '&::before': {
    content: '""',
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: theme.spacing(1),
    backgroundColor: isIncluded ? theme.palette.primary.main : theme.palette.action.disabled,
  }
}));

// Etiqueta de precio
const PriceTag = styled(Typography)(({ theme, isPremium, isEnterprise }) => ({
  fontWeight: 700,
  fontSize: '2.5rem',
  color: isPremium ? theme.palette.primary.main : isEnterprise ? theme.palette.secondary.main : theme.palette.text.primary,
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'flex-start',
  '& .currency': {
    fontSize: '1.2rem',
    marginRight: '4px',
    marginTop: '8px',
  },
  '& .period': {
    fontSize: '0.9rem',
    color: theme.palette.text.secondary,
    marginLeft: '4px',
    marginTop: '16px',
  }
}));

// Etiqueta de descuento
const DiscountTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '12px',
  right: '-30px',
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  padding: '4px 30px',
  transform: 'rotate(45deg)',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  zIndex: 1,
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

const SubscriptionPlansPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  
  const plans = {
    free: {
      name: 'Gratuito',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        { name: 'Generación de documentos básicos', included: true },
        { name: 'Visualización de documentos', included: true },
        { name: 'Descarga de documentos', included: true },
        { name: 'Límite de 5 documentos por mes', included: true },
        { name: 'Análisis de documentos', included: false },
        { name: 'Edición de documentos', included: false },
        { name: 'Guardado de plantillas', included: false },
        { name: 'Acceso a API', included: false },
        { name: 'Soporte prioritario', included: false },
      ]
    },
    premium: {
      name: 'Premium',
      monthlyPrice: 29.99,
      annualPrice: 299.88, // 20% de descuento: 29.99 * 12 * 0.8
      features: [
        { name: 'Generación de documentos básicos', included: true },
        { name: 'Generación de documentos avanzados', included: true },
        { name: 'Visualización de documentos', included: true },
        { name: 'Descarga de documentos', included: true },
        { name: 'Análisis de documentos', included: true },
        { name: 'Edición de documentos', included: true },
        { name: 'Guardado de plantillas', included: true },
        { name: 'Límite de 50 documentos por mes', included: true },
        { name: 'Acceso a API', included: false },
        { name: 'Soporte prioritario', included: false },
      ]
    },
    enterprise: {
      name: 'Enterprise',
      monthlyPrice: 99.99,
      annualPrice: 999.88, // 20% de descuento: 99.99 * 12 * 0.8
      features: [
        { name: 'Generación de documentos básicos', included: true },
        { name: 'Generación de documentos avanzados', included: true },
        { name: 'Visualización de documentos', included: true },
        { name: 'Descarga de documentos', included: true },
        { name: 'Análisis de documentos', included: true },
        { name: 'Edición de documentos', included: true },
        { name: 'Guardado de plantillas', included: true },
        { name: 'Documentos ilimitados', included: true },
        { name: 'Acceso a API', included: true },
        { name: 'Soporte prioritario', included: true },
        { name: 'Acceso para equipos', included: true },
        { name: 'Personalización de plantillas', included: true },
      ]
    }
  };
  
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };
  
  const handleToggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly');
  };
  
  const handleSubscribe = () => {
    setLoading(true);
    
    // Simulación de proceso de pago
    setTimeout(() => {
      setLoading(false);
      // Aquí iría la redirección a la página de pago o la lógica de suscripción
      console.log('Suscripción a plan:', selectedPlan, 'con ciclo de facturación:', billingCycle);
    }, 2000);
  };
  
  const getPrice = (plan) => {
    return billingCycle === 'monthly' 
      ? plans[plan].monthlyPrice 
      : plans[plan].annualPrice / 12;
  };
  
  const getTotalPrice = (plan) => {
    return billingCycle === 'monthly' 
      ? plans[plan].monthlyPrice 
      : plans[plan].annualPrice;
  };
  
  const getDiscount = (plan) => {
    if (billingCycle === 'annual' && plan !== 'free') {
      return '20% DESCUENTO';
    }
    return null;
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
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10} lg={10}>
            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <GradientTitle variant="h3" component="h1">
                  PLANES DE SUSCRIPCIÓN
                </GradientTitle>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
                  Elige el plan que mejor se adapte a tus necesidades
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="body1" 
                    color={billingCycle === 'monthly' ? 'primary' : 'textSecondary'}
                    sx={{ fontWeight: billingCycle === 'monthly' ? 600 : 400 }}
                  >
                    Facturación mensual
                  </Typography>
                  
                  <Button 
                    onClick={handleToggleBillingCycle}
                    sx={{ 
                      mx: 2,
                      position: 'relative',
                      width: '60px',
                      height: '30px',
                      borderRadius: '15px',
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '3px',
                        left: billingCycle === 'monthly' ? '5px' : '33px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        transition: 'left 0.3s ease'
                      }
                    }}
                  />
                  
                  <Typography 
                    variant="body1" 
                    color={billingCycle === 'annual' ? 'primary' : 'textSecondary'}
                    sx={{ fontWeight: billingCycle === 'annual' ? 600 : 400 }}
                  >
                    Facturación anual
                  </Typography>
                </Box>
                
                {billingCycle === 'annual' && (
                  <Typography variant="body2" color="error">
                    ¡Ahorra un 20% con la facturación anual!
                  </Typography>
                )}
              </Box>
            </motion.div>
            
            <Grid container spacing={4}>
              {/* Plan Gratuito */}
              <Grid item xs={12} md={4}>
                <motion.div variants={itemVariants}>
                  <PlanCard 
                    isSelected={selectedPlan === 'free'}
                    onClick={() => handleSelectPlan('free')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                      {plans.free.name}
                    </Typography>
                    
                    <PriceTag>
                      <span className="currency">$</span>
                      {getPrice('free')}
                      <span className="period">/{billingCycle === 'monthly' ? 'mes' : 'mes'}</span>
                    </PriceTag>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                      Ideal para usuarios ocasionales
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 3, flexGrow: 1 }}>
                      {plans.free.features.map((feature, index) => (
                        <FeatureLabel key={index} isIncluded={feature.included}>
                          <Typography variant="body2">
                            {feature.name}
                          </Typography>
                        </FeatureLabel>
                      ))}
                    </Box>
                    
                    <Button
                      variant={selectedPlan === 'free' ? 'contained' : 'outlined'}
                      color="primary"
                      fullWidth
                      onClick={() => handleSelectPlan('free')}
                      sx={{ mt: 'auto' }}
                    >
                      {selectedPlan === 'free' ? 'Plan Seleccionado' : 'Seleccionar Plan'}
                    </Button>
                  </PlanCard>
                </motion.div>
              </Grid>
              
              {/* Plan Premium */}
              <Grid item xs={12} md={4}>
                <motion.div variants={itemVariants}>
                  <PlanCard 
                    isSelected={selectedPlan === 'premium'}
                    isPremium
                    onClick={() => handleSelectPlan('premium')}
                    sx={{ cursor: 'pointer' }}
                  >
                    {getDiscount('premium') && (
                      <DiscountTag>{getDiscount('premium')}</DiscountTag>
                    )}
                    
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                      {plans.premium.name}
                    </Typography>
                    
                    <PriceTag isPremium>
                      <span className="currency">$</span>
                      {getPrice('premium').toFixed(2)}
                      <span className="period">/{billingCycle === 'monthly' ? 'mes' : 'mes'}</span>
                    </PriceTag>
                    
                    {billingCycle === 'annual' && (
                      <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                        ${getTotalPrice('premium').toFixed(2)} facturados anualmente
                      </Typography>
                    )}
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                      Perfecto para profesionales independientes
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 3, flexGrow: 1 }}>
                      {plans.premium.features.map((feature, index) => (
                        <FeatureLabel key={index} isIncluded={feature.included}>
                          <Typography variant="body2">
                            {feature.name}
                          </Typography>
                        </FeatureLabel>
                      ))}
                    </Box>
                    
                    <Button
                      variant={selectedPlan === 'premium' ? 'contained' : 'outlined'}
                      color="primary"
                      fullWidth
                      onClick={() => handleSelectPlan('premium')}
                      sx={{ mt: 'auto' }}
                    >
                      {selectedPlan === 'premium' ? 'Plan Seleccionado' : 'Seleccionar Plan'}
                    </Button>
                  </PlanCard>
                </motion.div>
              </Grid>
              
              {/* Plan Enterprise */}
              <Grid item xs={12} md={4}>
                <motion.div variants={itemVariants}>
                  <PlanCard 
                    isSelected={selectedPlan === 'enterprise'}
                    isEnterprise
                    onClick={() => handleSelectPlan('enterprise')}
                    sx={{ cursor: 'pointer' }}
                  >
                    {getDiscount('enterprise') && (
                      <DiscountTag>{getDiscount('enterprise')}</DiscountTag>
                    )}
                    
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                      {plans.enterprise.name}
                    </Typography>
                    
                    <PriceTag isEnterprise>
                      <span className="currency">$</span>
                      {getPrice('enterprise').toFixed(2)}
                      <span className="period">/{billingCycle === 'monthly' ? 'mes' : 'mes'}</span>
                    </PriceTag>
                    
                    {billingCycle === 'annual' && (
                      <Typography variant="body2" color="secondary" sx={{ mb: 1 }}>
                        ${getTotalPrice('enterprise').toFixed(2)} facturados anualmente
                      </Typography>
                    )}
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                      Ideal para empresas y equipos
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 3, flexGrow: 1 }}>
                      {plans.enterprise.features.map((feature, index) => (
                        <FeatureLabel key={index} isIncluded={feature.included}>
                          <Typography variant="body2">
                            {feature.name}
                          </Typography>
                        </FeatureLabel>
                      ))}
                    </Box>
                    
                    <Button
                      variant={selectedPlan === 'enterprise' ? 'contained' : 'outlined'}
                      color="secondary"
                      fullWidth
                      onClick={() => handleSelectPlan('enterprise')}
                      sx={{ mt: 'auto' }}
                    >
                      {selectedPlan === 'enterprise' ? 'Plan Seleccionado' : 'Seleccionar Plan'}
                    </Button>
                  </PlanCard>
                </motion.div>
              </Grid>
            </Grid>
            
            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                {selectedPlan !== 'free' ? (
                  <Button
                    variant="contained"
                    color={selectedPlan === 'premium' ? 'primary' : 'secondary'}
                    size="large"
                    onClick={handleSubscribe}
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
                      `Suscribirse por $${getTotalPrice(selectedPlan).toFixed(2)}${billingCycle === 'monthly' ? '/mes' : '/año'}`
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleSubscribe}
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
                      'Comenzar Gratis'
                    )}
                  </Button>
                )}
                
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Puedes cambiar o cancelar tu plan en cualquier momento
                </Typography>
              </Box>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Box sx={{ mt: 6, p: 3, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                  Preguntas frecuentes
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      ¿Puedo cambiar de plan después?
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplicarán al inicio del siguiente ciclo de facturación.
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      ¿Cómo funciona la facturación anual?
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Con la facturación anual, pagas por un año completo por adelantado y obtienes un 20% de descuento en comparación con la facturación mensual.
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      ¿Puedo cancelar mi suscripción?
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Puedes cancelar tu suscripción en cualquier momento. Si cancelas, mantendrás el acceso hasta el final del período de facturación actual.
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      ¿Qué métodos de pago aceptan?
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Aceptamos todas las principales tarjetas de crédito y débito, así como PayPal para pagos recurrentes.
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </AnimatedContainer>
  );
};

export default SubscriptionPlansPage;
