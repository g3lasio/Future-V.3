import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import DescriptionIcon from '@mui/icons-material/Description';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

// Tarjeta con efecto de brillo y hover
const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(145deg, rgba(18,18,18,0.9) 0%, rgba(26,26,26,0.9) 100%)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 12px 30px rgba(0, 188, 212, 0.2)`,
  }
}));

// Título con efecto de gradiente
const GradientTitle = styled(Typography)(({ theme }) => ({
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
      staggerChildren: 0.2
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

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Generación de Documentos',
      description: 'Crea documentos legales personalizados en minutos utilizando nuestra avanzada inteligencia artificial.',
      icon: <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      action: () => navigate('/generator')
    },
    {
      title: 'Análisis de Documentos',
      description: 'Analiza documentos legales para extraer información clave, identificar riesgos y generar resúmenes.',
      icon: <AnalyticsIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
      action: () => navigate('/analyzer')
    },
    {
      title: 'Edición de Documentos',
      description: 'Edita, fusiona y personaliza documentos con nuestra interfaz intuitiva y asistencia inteligente.',
      icon: <EditIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      action: () => navigate('/editor')
    }
  ];

  return (
    <Container maxWidth="lg">
      <AnimatedContainer
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ textAlign: 'center', mb: 8, mt: 4 }}>
          <motion.div variants={itemVariants}>
            <GradientTitle variant="h2" component="h1">
              FUTURELEX
            </GradientTitle>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography variant="h5" color="textSecondary" sx={{ mb: 4 }}>
              Plataforma de generación automatizada de documentos legales con IA
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
              FutureLex revoluciona la forma en que se crean, analizan y editan documentos legales. 
              Utilizando inteligencia artificial avanzada, nuestra plataforma permite generar documentos 
              personalizados, analizar contenido legal y editar documentos de manera eficiente, 
              todo desde una interfaz intuitiva y futurista.
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/generator')}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: '4px',
                boxShadow: '0 4px 20px rgba(0, 188, 212, 0.3)',
              }}
            >
              Comenzar Ahora
            </Button>
          </motion.div>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div variants={itemVariants}>
                <FeatureCard>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 4 }}>
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                      {feature.description}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={feature.action}
                      >
                        Explorar
                      </Button>
                    </Box>
                  </CardContent>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </AnimatedContainer>
    </Container>
  );
};

export default HomePage;
