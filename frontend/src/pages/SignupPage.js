import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Divider, Link, IconButton, InputAdornment, Stepper, Step, StepLabel, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import AppleIcon from '@mui/icons-material/Apple';
import GitHubIcon from '@mui/icons-material/GitHub';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
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

const SignupPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [signupMethod, setSignupMethod] = useState('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    verificationCode: '',
    profileType: 'individual',
    companyName: '',
    companyPosition: '',
    companyIndustry: ''
  });
  
  const steps = ['Información personal', 'Detalles de perfil', 'Verificación'];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (activeStep < steps.length - 1) {
      handleNext();
      return;
    }
    
    // Aquí iría la lógica de registro
    console.log('Registrando con:', signupMethod, formData);
  };
  
  const handleProviderSignup = (provider) => {
    console.log(`Registrando con ${provider}`);
    
    if (provider === 'phone') {
      setSignupMethod('phone');
    } else {
      // Aquí iría la lógica de autenticación con proveedores
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            {signupMethod === 'email' ? (
              <>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
                
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
                    type="email"
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
                  <TextField
                    fullWidth
                    label="Confirmar contraseña"
                    name="confirmPassword"
                    value={formData.confirmPassword}
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
                    }}
                  />
                </motion.div>
              </>
            ) : signupMethod === 'phone' ? (
              <>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
                
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
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Código de verificación"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                    helperText="Haz clic en 'Enviar código' para recibir un código de verificación"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => console.log('Enviando código a', formData.phone)}
                          >
                            Enviar código
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
              </>
            ) : null}
          </>
        );
      case 1:
        return (
          <>
            <motion.div variants={itemVariants}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel id="profile-type-label">Tipo de perfil</InputLabel>
                <Select
                  labelId="profile-type-label"
                  id="profileType"
                  name="profileType"
                  value={formData.profileType}
                  onChange={handleChange}
                  label="Tipo de perfil"
                >
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="business">Empresa</MenuItem>
                </Select>
              </FormControl>
            </motion.div>
            
            {formData.profileType === 'business' && (
              <>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Nombre de la empresa"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Cargo en la empresa"
                    name="companyPosition"
                    value={formData.companyPosition}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="industry-label">Industria</InputLabel>
                    <Select
                      labelId="industry-label"
                      id="companyIndustry"
                      name="companyIndustry"
                      value={formData.companyIndustry}
                      onChange={handleChange}
                      label="Industria"
                    >
                      <MenuItem value="legal">Legal</MenuItem>
                      <MenuItem value="real_estate">Bienes raíces</MenuItem>
                      <MenuItem value="finance">Finanzas</MenuItem>
                      <MenuItem value="construction">Construcción</MenuItem>
                      <MenuItem value="technology">Tecnología</MenuItem>
                      <MenuItem value="healthcare">Salud</MenuItem>
                      <MenuItem value="education">Educación</MenuItem>
                      <MenuItem value="other">Otra</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </>
            )}
          </>
        );
      case 2:
        return (
          <>
            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Resumen de registro
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Por favor verifica que la información sea correcta antes de continuar
                </Typography>
              </Box>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Nombre:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {formData.name}
                  </Typography>
                </Grid>
                
                {signupMethod === 'email' && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Correo electrónico:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {formData.email}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {signupMethod === 'phone' && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Teléfono:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {formData.phone}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tipo de perfil:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {formData.profileType === 'individual' ? 'Individual' : 'Empresa'}
                  </Typography>
                </Grid>
                
                {formData.profileType === 'business' && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Empresa:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {formData.companyName}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Cargo:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {formData.companyPosition}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Industria:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {formData.companyIndustry}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Al hacer clic en "Completar registro", aceptas nuestros{' '}
                  <Link href="/terms" underline="hover" color="primary">
                    Términos y Condiciones
                  </Link>{' '}
                  y{' '}
                  <Link href="/privacy" underline="hover" color="primary">
                    Política de Privacidad
                  </Link>
                </Typography>
              </Box>
            </motion.div>
          </>
        );
      default:
        return 'Paso desconocido';
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
        py: 4
      }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <motion.div variants={itemVariants}>
              <StyledPaper>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <GradientTitle variant="h4" component="h1">
                    FUTURELEX
                  </GradientTitle>
                  <Typography variant="body1" color="textSecondary">
                    Crea tu cuenta para comenzar
                  </Typography>
                </Box>
                
                <motion.div variants={itemVariants}>
                  <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </motion.div>
                
                <form onSubmit={handleSubmit}>
                  {getStepContent(activeStep)}
                  
                  <motion.div variants={itemVariants}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        variant="outlined"
                      >
                        Atrás
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        {activeStep === steps.length - 1 ? 'Completar registro' : 'Siguiente'}
                      </Button>
                    </Box>
                  </motion.div>
                </form>
                
                {activeStep === 0 && (
                  <>
                    <motion.div variants={itemVariants}>
                      <Box sx={{ my: 3 }}>
                        <Divider>
                          <Typography variant="body2" color="textSecondary">
                            O regístrate con
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
                            onClick={() => handleProviderSignup('apple')}
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
                            onClick={() => handleProviderSignup('github')}
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
                            onClick={() => handleProviderSignup('phone')}
                            startIcon={<PhoneIcon />}
                          >
                            Teléfono
                          </ProviderButton>
                        </Grid>
                      </Grid>
                    </motion.div>
                  </>
                )}
                
                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      ¿Ya tienes una cuenta?{' '}
                      <Link href="/login" underline="hover" color="primary">
                        Inicia sesión
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

export default SignupPage;
