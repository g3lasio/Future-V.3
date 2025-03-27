import React from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Divider, Link, IconButton, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import AppleIcon from '@mui/icons-material/Apple';
import GitHubIcon from '@mui/icons-material/GitHub';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

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

// Botón de proveedor de autenticación
const ProviderButton = styled(Button)(({ theme, provider }) => {
  const providerColors = {
    apple: {
      bg: '#000000',
      hover: '#333333',
      text: '#ffffff'
    },
    github: {
      bg: '#24292e',
      hover: '#3a3a3a',
      text: '#ffffff'
    },
    phone: {
      bg: '#4caf50',
      hover: '#388e3c',
      text: '#ffffff'
    }
  };
  
  const colors = providerColors[provider] || {
    bg: theme.palette.primary.main,
    hover: theme.palette.primary.dark,
    text: theme.palette.primary.contrastText
  };
  
  return {
    backgroundColor: colors.bg,
    color: colors.text,
    padding: theme.spacing(1.2),
    borderRadius: theme.shape.borderRadius,
    fontWeight: 600,
    letterSpacing: '0.5px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: colors.hover,
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
    }
  };
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

const LoginPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginMethod, setLoginMethod] = React.useState('email');
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    phone: '',
    verificationCode: ''
  });
  const [step, setStep] = React.useState(1);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (loginMethod === 'phone' && step === 1) {
      // Simular envío de código de verificación
      setStep(2);
      return;
    }
    
    // Aquí iría la lógica de autenticación
    console.log('Iniciando sesión con:', loginMethod, formData);
  };
  
  const handleProviderLogin = (provider) => {
    console.log(`Iniciando sesión con ${provider}`);
    
    if (provider === 'phone') {
      setLoginMethod('phone');
    } else {
      // Aquí iría la lógica de autenticación con proveedores
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
        py: 4
      }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={8} md={6} lg={4}>
            <motion.div variants={itemVariants}>
              <StyledPaper>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <GradientTitle variant="h4" component="h1">
                    FUTURELEX
                  </GradientTitle>
                  <Typography variant="body1" color="textSecondary">
                    Accede a tu cuenta para continuar
                  </Typography>
                </Box>
                
                {loginMethod === 'email' ? (
                  <form onSubmit={handleSubmit}>
                    <motion.div variants={itemVariants}>
                      <TextField
                        fullWidth
                        label="Correo electrónico"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        variant="outlined"
                        margin="normal"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <TextField
                        fullWidth
                        label="Contraseña"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        variant="outlined"
                        margin="normal"
                        required
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={toggleShowPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Box sx={{ textAlign: 'right', mb: 2 }}>
                        <Link href="/forgot-password" underline="hover" color="primary">
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </Box>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ 
                          py: 1.5,
                          mb: 2,
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }}
                      >
                        Iniciar Sesión
                      </Button>
                    </motion.div>
                  </form>
                ) : loginMethod === 'phone' ? (
                  <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                      <motion.div variants={itemVariants}>
                        <TextField
                          fullWidth
                          label="Número de teléfono"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          variant="outlined"
                          margin="normal"
                          required
                          placeholder="+1 234 567 8900"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          color="primary"
                          size="large"
                          sx={{ 
                            py: 1.5,
                            mt: 2,
                            mb: 2,
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                          }}
                        >
                          Enviar Código
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div variants={itemVariants}>
                        <TextField
                          fullWidth
                          label="Código de verificación"
                          name="verificationCode"
                          value={formData.verificationCode}
                          onChange={handleChange}
                          variant="outlined"
                          margin="normal"
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          color="primary"
                          size="large"
                          sx={{ 
                            py: 1.5,
                            mt: 2,
                            mb: 2,
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                          }}
                        >
                          Verificar Código
                        </Button>
                        
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <Link 
                            href="#" 
                            underline="hover" 
                            color="primary"
                            onClick={() => setStep(1)}
                          >
                            Cambiar número de teléfono
                          </Link>
                        </Box>
                      </motion.div>
                    )}
                  </form>
                ) : null}
                
                <motion.div variants={itemVariants}>
                  <Box sx={{ my: 3 }}>
                    <Divider>
                      <Typography variant="body2" color="textSecondary">
                        O continúa con
                      </Typography>
                    </Divider>
                  </Box>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <ProviderButton
                        fullWidth
                        variant="contained"
                        provider="apple"
                        onClick={() => handleProviderLogin('apple')}
                        startIcon={<AppleIcon />}
                      >
                        Apple
                      </ProviderButton>
                    </Grid>
                    <Grid item xs={4}>
                      <ProviderButton
                        fullWidth
                        variant="contained"
                        provider="github"
                        onClick={() => handleProviderLogin('github')}
                        startIcon={<GitHubIcon />}
                      >
                        GitHub
                      </ProviderButton>
                    </Grid>
                    <Grid item xs={4}>
                      <ProviderButton
                        fullWidth
                        variant="contained"
                        provider="phone"
                        onClick={() => handleProviderLogin('phone')}
                        startIcon={<PhoneIcon />}
                      >
                        Teléfono
                      </ProviderButton>
                    </Grid>
                  </Grid>
                </motion.div>
                
                {loginMethod === 'phone' && (
                  <motion.div variants={itemVariants}>
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <Button
                        color="primary"
                        onClick={() => {
                          setLoginMethod('email');
                          setStep(1);
                        }}
                      >
                        Volver a inicio de sesión con email
                      </Button>
                    </Box>
                  </motion.div>
                )}
                
                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      ¿No tienes una cuenta?{' '}
                      <Link href="/signup" underline="hover" color="primary">
                        Regístrate
                      </Link>
                    </Typography>
                  </Box>
                </motion.div>
              </StyledPaper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </AnimatedContainer>
  );
};

export default LoginPage;
