import React, { useState } from 'react';
import { Box, Typography, Paper, Stepper, Step, StepLabel, Button, TextField, Grid, MenuItem, CircularProgress, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

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

// Componente de vista previa del documento
const DocumentPreview = styled(Card)(({ theme }) => ({
  height: '100%',
  background: 'rgba(10,10,10,0.8)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
  maxHeight: '500px',
  overflow: 'auto',
  padding: theme.spacing(2),
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap',
  position: 'relative',
}));

const DocumentGeneratorPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [documentData, setDocumentData] = useState({});
  const [generatedDocument, setGeneratedDocument] = useState('');
  
  // Pasos del proceso de generación
  const steps = ['Seleccionar tipo de documento', 'Proporcionar información', 'Generar y descargar'];
  
  // Tipos de documentos disponibles
  const documentTypes = [
    { value: 'contrato_arrendamiento', label: 'Contrato de Arrendamiento' },
    { value: 'contrato_servicios', label: 'Contrato de Servicios Profesionales' },
    { value: 'acuerdo_confidencialidad', label: 'Acuerdo de Confidencialidad' },
    { value: 'carta_renuncia', label: 'Carta de Renuncia' },
    { value: 'demanda_civil', label: 'Demanda Civil' },
    { value: 'poder_notarial', label: 'Poder Notarial' },
  ];
  
  // Campos dinámicos según el tipo de documento
  const getDocumentFields = () => {
    switch(documentType) {
      case 'contrato_arrendamiento':
        return [
          { name: 'arrendador', label: 'Nombre del Arrendador', type: 'text', required: true },
          { name: 'arrendatario', label: 'Nombre del Arrendatario', type: 'text', required: true },
          { name: 'direccion', label: 'Dirección del Inmueble', type: 'text', required: true },
          { name: 'renta', label: 'Monto de la Renta', type: 'number', required: true },
          { name: 'duracion', label: 'Duración del Contrato (meses)', type: 'number', required: true },
          { name: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date', required: true },
          { name: 'deposito', label: 'Monto del Depósito', type: 'number', required: true },
        ];
      case 'contrato_servicios':
        return [
          { name: 'prestador', label: 'Nombre del Prestador de Servicios', type: 'text', required: true },
          { name: 'cliente', label: 'Nombre del Cliente', type: 'text', required: true },
          { name: 'servicios', label: 'Descripción de los Servicios', type: 'textarea', required: true },
          { name: 'honorarios', label: 'Honorarios', type: 'number', required: true },
          { name: 'duracion', label: 'Duración del Contrato (meses)', type: 'number', required: true },
          { name: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date', required: true },
        ];
      case 'acuerdo_confidencialidad':
        return [
          { name: 'parte_divulgadora', label: 'Nombre de la Parte Divulgadora', type: 'text', required: true },
          { name: 'parte_receptora', label: 'Nombre de la Parte Receptora', type: 'text', required: true },
          { name: 'proposito', label: 'Propósito del Intercambio de Información', type: 'textarea', required: true },
          { name: 'duracion', label: 'Duración del Acuerdo (meses)', type: 'number', required: true },
          { name: 'fecha', label: 'Fecha del Acuerdo', type: 'date', required: true },
        ];
      case 'carta_renuncia':
        return [
          { name: 'empleado', label: 'Nombre del Empleado', type: 'text', required: true },
          { name: 'empresa', label: 'Nombre de la Empresa', type: 'text', required: true },
          { name: 'puesto', label: 'Puesto Actual', type: 'text', required: true },
          { name: 'fecha_renuncia', label: 'Fecha Efectiva de Renuncia', type: 'date', required: true },
          { name: 'motivo', label: 'Motivo de la Renuncia', type: 'textarea', required: false },
        ];
      case 'demanda_civil':
        return [
          { name: 'demandante', label: 'Nombre del Demandante', type: 'text', required: true },
          { name: 'demandado', label: 'Nombre del Demandado', type: 'text', required: true },
          { name: 'tribunal', label: 'Tribunal', type: 'text', required: true },
          { name: 'causa', label: 'Causa de la Demanda', type: 'textarea', required: true },
          { name: 'pretension', label: 'Pretensión', type: 'textarea', required: true },
          { name: 'fecha', label: 'Fecha', type: 'date', required: true },
        ];
      case 'poder_notarial':
        return [
          { name: 'poderdante', label: 'Nombre del Poderdante', type: 'text', required: true },
          { name: 'apoderado', label: 'Nombre del Apoderado', type: 'text', required: true },
          { name: 'facultades', label: 'Facultades Otorgadas', type: 'textarea', required: true },
          { name: 'duracion', label: 'Duración del Poder', type: 'text', required: true },
          { name: 'fecha', label: 'Fecha', type: 'date', required: true },
        ];
      default:
        return [];
    }
  };
  
  // Manejar cambio de paso
  const handleNext = () => {
    if (activeStep === 1) {
      generateDocument();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Manejar cambio en los campos del formulario
  const handleFieldChange = (field, value) => {
    setDocumentData({
      ...documentData,
      [field]: value
    });
  };
  
  // Generar documento con IA
  const generateDocument = () => {
    setLoading(true);
    
    // Simulación de llamada a la API (en producción, esto sería una llamada real al backend)
    setTimeout(() => {
      // Documento de ejemplo basado en el tipo seleccionado
      let documentContent = '';
      
      if (documentType === 'contrato_arrendamiento') {
        documentContent = `CONTRATO DE ARRENDAMIENTO

ENTRE:
${documentData.arrendador}, en adelante denominado "EL ARRENDADOR"

Y:
${documentData.arrendatario}, en adelante denominado "EL ARRENDATARIO"

CLÁUSULAS:

PRIMERA - OBJETO DEL CONTRATO
El Arrendador da en arrendamiento al Arrendatario el inmueble ubicado en ${documentData.direccion}.

SEGUNDA - DURACIÓN
El presente contrato tendrá una duración de ${documentData.duracion} meses, comenzando el ${new Date(documentData.fecha_inicio).toLocaleDateString()} y finalizando el ${new Date(new Date(documentData.fecha_inicio).setMonth(new Date(documentData.fecha_inicio).getMonth() + parseInt(documentData.duracion))).toLocaleDateString()}.

TERCERA - RENTA
El Arrendatario pagará al Arrendador la cantidad de $${documentData.renta} mensuales, pagaderos dentro de los primeros cinco días de cada mes.

CUARTA - DEPÓSITO
El Arrendatario entrega al Arrendador la cantidad de $${documentData.deposito} como depósito en garantía.

QUINTA - SERVICIOS
Los servicios de agua, luz, gas y demás serán por cuenta del Arrendatario.

SEXTA - CONSERVACIÓN
El Arrendatario se obliga a conservar el inmueble en buen estado.

SÉPTIMA - PROHIBICIONES
El Arrendatario no podrá subarrendar ni ceder los derechos del presente contrato.

OCTAVA - LEGISLACIÓN APLICABLE
Para todo lo no previsto en el presente contrato, las partes se someten a la legislación aplicable.

Firmado en ______________ el día ${new Date().toLocaleDateString()}.


_______________________          _______________________
     EL ARRENDADOR                   EL ARRENDATARIO
`;
      } else if (documentType === 'carta_renuncia') {
        documentContent = `[Lugar y Fecha: ${new Date().toLocaleDateString()}]

[Nombre del Destinatario]
[Puesto]
[Nombre de la Empresa: ${documentData.empresa}]
[Dirección]

Asunto: Carta de Renuncia

Estimado/a [Nombre del Destinatario]:

Por medio de la presente, me permito comunicarle mi decisión de renunciar al cargo de ${documentData.puesto} que he venido desempeñando en ${documentData.empresa}, siendo mi último día de labores el ${new Date(documentData.fecha_renuncia).toLocaleDateString()}.

${documentData.motivo ? `Las razones que me llevan a tomar esta decisión son: ${documentData.motivo}` : 'Esta decisión responde a motivos personales y profesionales.'}

Agradezco la oportunidad que me brindaron de formar parte de esta empresa, así como el apoyo y la confianza depositados en mí durante este tiempo.

Quedo a su disposición para realizar el proceso de entrega de mi puesto y capacitar a la persona que me reemplazará, con el fin de garantizar una transición ordenada.

Atentamente,


_______________________
${documentData.empleado}
`;
      } else {
        documentContent = `DOCUMENTO GENERADO: ${documentType.toUpperCase()}

Este es un documento de ejemplo generado con los siguientes datos:
${Object.entries(documentData).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

En una implementación real, este documento sería generado utilizando Claude AI con los datos proporcionados.
`;
      }
      
      setGeneratedDocument(documentContent);
      setLoading(false);
      setActiveStep(2);
    }, 2000);
  };
  
  // Descargar documento
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedDocument], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${documentType}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Renderizar el contenido según el paso actual
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Seleccione el tipo de documento que desea generar:
            </Typography>
            <TextField
              select
              fullWidth
              label="Tipo de Documento"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              variant="outlined"
              margin="normal"
              sx={{ mb: 4 }}
            >
              {documentTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Complete la información requerida:
            </Typography>
            <Grid container spacing={3}>
              {getDocumentFields().map((field) => (
                <Grid item xs={12} sm={field.type === 'textarea' ? 12 : 6} key={field.name}>
                  {field.type === 'textarea' ? (
                    <TextField
                      fullWidth
                      label={field.label}
                      value={documentData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      variant="outlined"
                      required={field.required}
                      multiline
                      rows={4}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label={field.label}
                      value={documentData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      variant="outlined"
                      required={field.required}
                      type={field.type}
                      InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Documento generado:
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <DocumentPreview>
                  {generatedDocument}
                </DocumentPreview>
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudDownloadIcon />}
                  onClick={handleDownload}
                  size="large"
                >
                  Descargar Documento
                </Button>
              </Grid>
            </Grid>
          </Box>
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
      <Box sx={{ mb: 4 }}>
        <motion.div variants={itemVariants}>
          <GradientTitle variant="h4" component="h1">
            Generador de Documentos
          </GradientTitle>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="body1" color="textSecondary">
            Cree documentos legales personalizados en minutos utilizando nuestra avanzada inteligencia artificial.
          </Typography>
        </motion.div>
      </Box>
      
      <motion.div variants={itemVariants}>
        <StyledPaper>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 3 }}>
                Generando documento...
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Nuestro sistema de IA está creando su documento personalizado.
              </Typography>
            </Box>
          ) : (
            <>
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Atrás
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={(activeStep === 0 && !documentType) || (activeStep === 2)}
                  endIcon={activeStep === 1 ? <SendIcon /> : null}
                >
                  {activeStep === 1 ? 'Generar' : 'Siguiente'}
                </Button>
              </Box>
            </>
          )}
        </StyledPaper>
      </motion.div>
    </AnimatedContainer>
  );
};

export default DocumentGeneratorPage;
