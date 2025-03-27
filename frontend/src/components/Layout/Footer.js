import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Pie de página con efecto de borde brillante en la parte superior
const StyledFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
  marginTop: 'auto',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: '1px',
    background: `linear-gradient(to right, transparent, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, transparent)`,
  },
}));

const Footer = () => {
  return (
    <StyledFooter
      component={motion.footer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: { xs: 2, md: 0 } }}>
            © {new Date().getFullYear()} FutureLex. Todos los derechos reservados.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" color="text.secondary" underline="hover">
              Términos de Servicio
            </Link>
            <Link href="#" color="text.secondary" underline="hover">
              Política de Privacidad
            </Link>
            <Link href="#" color="text.secondary" underline="hover">
              Contacto
            </Link>
          </Box>
        </Box>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
