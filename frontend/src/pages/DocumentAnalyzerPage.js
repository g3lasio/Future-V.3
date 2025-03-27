import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Grid, MenuItem, CircularProgress, Card, CardContent, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SummarizeIcon from '@mui/icons-material/Summarize';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import WarningIcon from '@mui/icons-material/Warning';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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

// Área de carga de archivos con efecto de borde punteado
const UploadArea = styled(Box)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.2)'}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  background: isDragActive ? 'rgba(0, 188, 212, 0.05)' : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    background: 'rgba(0, 188, 212, 0.05)',
  },
}));

// Pestaña personalizada
const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 120,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

const DocumentAnalyzerPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState('summary');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Tipos de análisis disponibles
  const analysisTypes = [
    { value: 'summary', label: 'Resumen', icon: <SummarizeIcon /> },
    { value: 'extraction', label: 'Extracción de Información', icon: <FindInPageIcon /> },
    { value: 'risks', label: 'Identificación de Riesgos', icon: <WarningIcon /> },
  ];
  
  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Manejar carga de archivo
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
    }
  };
  
  // Manejar arrastrar y soltar
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };
  
  const handleDragLeave = () => {
    setIsDragActive(false);
  };
  
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };
  
  // Analizar documento
  const analyzeDocument = () => {
    if (!file) return;
    
    setLoading(true);
    
    // Simulación de llamada a la API (en producción, esto sería una llamada real al backend)
    setTimeout(() => {
      // Resultado de ejemplo basado en el tipo de análisis
      let result = '';
      
      switch (analysisType) {
        case 'summary':
          result = `# Resumen del Documento: ${fileName}

## Tipo de Documento
Contrato de prestación de servicios profesionales

## Partes Involucradas
- Parte A: Empresa XYZ S.A. de C.V. (Contratante)
- Parte B: Juan Pérez González (Prestador de servicios)

## Propósito Principal
Establecer los términos y condiciones para la prestación de servicios de consultoría en materia legal y fiscal.

## Términos Clave
- Duración: 12 meses con posibilidad de renovación
- Honorarios: $50,000 MXN mensuales más IVA
- Forma de pago: Transferencia bancaria dentro de los primeros 5 días de cada mes
- Confidencialidad: Estricta sobre toda la información compartida

## Obligaciones Principales
- Del Prestador: Proporcionar asesoría legal y fiscal, elaborar dictámenes, representar a la empresa
- Del Contratante: Proporcionar información necesaria, pagar honorarios en tiempo y forma

## Fechas Importantes
- Fecha de firma: 15 de enero de 2025
- Fecha de inicio: 1 de febrero de 2025
- Fecha de terminación: 31 de enero de 2026

## Cláusulas Destacables
- Cláusula de no competencia por 6 meses después de la terminación
- Posibilidad de terminación anticipada con 30 días de aviso previo
- Penalización por incumplimiento equivalente a 3 meses de honorarios`;
          break;
        case 'extraction':
          result = `# Información Extraída: ${fileName}

## Datos Generales
| Campo | Valor |
|-------|-------|
| Tipo de documento | Contrato de prestación de servicios profesionales |
| Fecha de firma | 15 de enero de 2025 |
| Vigencia | 12 meses (01/02/2025 - 31/01/2026) |

## Partes Involucradas
| Parte | Nombre | Representante | RFC |
|-------|--------|---------------|-----|
| Contratante | Empresa XYZ S.A. de C.V. | María Rodríguez López | EXY980523AB1 |
| Prestador | Juan Pérez González | N/A | PEGJ850612CD7 |

## Términos Financieros
| Concepto | Valor |
|----------|-------|
| Honorarios mensuales | $50,000.00 MXN + IVA |
| Forma de pago | Transferencia bancaria |
| Fecha de pago | Primeros 5 días de cada mes |
| Cuenta bancaria | BBVA 012345678901234567 |

## Servicios Contratados
- Asesoría legal en materia corporativa
- Consultoría fiscal
- Elaboración de dictámenes
- Representación legal ante autoridades

## Obligaciones y Responsabilidades
- Confidencialidad por 5 años
- No competencia por 6 meses
- Entrega de reportes mensuales
- Disponibilidad de 40 horas semanales`;
          break;
        case 'risks':
          result = `# Análisis de Riesgos: ${fileName}

## Riesgos Identificados

### 1. Cláusula de Confidencialidad Ambigua
**Ubicación:** Cláusula Quinta, párrafo segundo
**Descripción:** La definición de "información confidencial" es demasiado amplia y podría interpretarse de manera que incluya conocimientos generales del prestador.
**Nivel de Riesgo:** Alto
**Recomendación:** Especificar claramente qué se considera información confidencial y excluir explícitamente el conocimiento general y la experiencia previa.

### 2. Ausencia de Limitación de Responsabilidad
**Ubicación:** No especificada en el documento
**Descripción:** El contrato no establece límites a la responsabilidad del prestador de servicios.
**Nivel de Riesgo:** Alto
**Recomendación:** Incluir una cláusula que limite la responsabilidad del prestador a una cantidad específica, como el valor total del contrato.

### 3. Terminación Anticipada Desequilibrada
**Ubicación:** Cláusula Décima
**Descripción:** El contratante puede terminar el contrato con 30 días de aviso, pero el prestador requiere 60 días.
**Nivel de Riesgo:** Medio
**Recomendación:** Equilibrar los términos de terminación anticipada para ambas partes.

### 4. Propiedad Intelectual Indefinida
**Ubicación:** Cláusula Octava
**Descripción:** No queda claro quién es el propietario de los materiales desarrollados durante la prestación de servicios.
**Nivel de Riesgo:** Medio
**Recomendación:** Especificar claramente que todos los materiales desarrollados son propiedad del contratante.

### 5. Ausencia de Mecanismo de Resolución de Disputas
**Ubicación:** No especificada en el documento
**Descripción:** El contrato no establece un mecanismo claro para la resolución de disputas.
**Nivel de Riesgo:** Medio
**Recomendación:** Incluir una cláusula de arbitraje o mediación como paso previo a la vía judicial.

## Resumen de Riesgos
- 2 riesgos de nivel Alto
- 3 riesgos de nivel Medio
- 0 riesgos de nivel Bajo

## Conclusión
El documento presenta varios riesgos significativos que deberían abordarse antes de su firma. Las principales preocupaciones están relacionadas con la confidencialidad, la responsabilidad ilimitada y los desequilibrios en las condiciones de terminación.`;
          break;
        default:
          result = `Análisis no disponible para el tipo seleccionado.`;
      }
      
      setAnalysisResult(result);
      setLoading(false);
      setActiveTab(1); // Cambiar a la pestaña de resultados
    }, 2000);
  };
  
  // Descargar resultado
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([analysisResult], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `analisis_${analysisType}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
            Analizador de Documentos
          </GradientTitle>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="body1" color="textSecondary">
            Analice documentos legales para extraer información clave, identificar riesgos y generar resúmenes.
          </Typography>
        </motion.div>
      </Box>
      
      <motion.div variants={itemVariants}>
        <StyledPaper>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              mb: 4,
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(90deg, #00bcd4, #7c4dff)',
              }
            }}
          >
            <StyledTab label="Cargar Documento" />
            <StyledTab label="Resultados" disabled={!analysisResult} />
          </Tabs>
          
          {activeTab === 0 ? (
            <Box>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Seleccione un documento para analizar
                  </Typography>
                  
                  <input
                    type="file"
                    id="file-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  
                  <UploadArea
                    isDragActive={isDragActive}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload').click()}
                    sx={{ mb: 3 }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Arrastre y suelte su documento aquí
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      o haga clic para seleccionar un archivo
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                      Formatos soportados: PDF, DOC, DOCX, TXT
                    </Typography>
                  </UploadArea>
                  
                  {fileName && (
                    <Box sx={{ mt: 2, mb: 3 }}>
                      <Typography variant="subtitle1">
                        Archivo seleccionado:
                      </Typography>
                      <Typography variant="body2" color="primary.main">
                        {fileName}
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Tipo de análisis
                  </Typography>
                  
                  <TextField
                    select
                    fullWidth
                    label="Seleccione el tipo de análisis"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    variant="outlined"
                    margin="normal"
                    sx={{ mb: 4 }}
                  >
                    {analysisTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 1 }}>{option.icon}</Box>
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<AnalyticsIcon />}
                    onClick={analyzeDocument}
                    disabled={!file || loading}
                    fullWidth
                  >
                    {loading ? 'Analizando...' : 'Analizar Documento'}
                  </Button>
                  
                  {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <CircularProgress />
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Descripción del análisis
                  </Typography>
                  
                  {analysisType === 'summary' && (
                    <Box>
                      <Typography variant="subtitle1" color="primary.main" gutterBottom>
                        Resumen del Documento
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Este análisis genera un resumen conciso del documento, identificando:
                      </Typography>
                      <ul>
                        <Typography component="li" variant="body2">Tipo de documento</Typography>
                        <Typography component="li" variant="body2">Partes involucradas</Typography>
                        <Typography component="li" variant="body2">Propósito principal</Typography>
                        <Typography component="li" variant="body2">Términos clave</Typography>
                        <Typography component="li" variant="body2">Obligaciones principales</Typography>
                        <Typography component="li" variant="body2">Fechas importantes</Typography>
                        <Typography component="li" variant="body2">Cláusulas destacables</Typography>
                      </ul>
                      <Typography variant="body2">
                        Ideal para obtener rápidamente una visión general del contenido y propósito del documento.
                      </Typography>
                    </Box>
                  )}
                  
                  {analysisType === 'extraction' && (
                    <Box>
                      <Typography variant="subtitle1" color="primary.main" gutterBottom>
                        Extracción de Información
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Este análisis extrae información específica del documento, como:
                      </Typography>
                      <ul>
                        <Typography component="li" variant="body2">Nombres de las partes</Typography>
                        <Typography component="li" variant="body2">Fechas mencionadas</Typography>
                        <Typography component="li" variant="body2">Montos financieros</Typography>
                        <Typography component="li" variant="body2">Plazos y términos</Typography>
                        <Typography component="li" variant="body2">Obligaciones de cada parte</Typography>
                        <Typography component="li" variant="body2">Condiciones especiales</Typography>
                        <Typography component="li" variant="body2">Información de contacto</Typography>
                      </ul>
                      <Typography variant="body2">
                        Útil para identificar rápidamente datos clave sin tener que leer todo el documento.
                      </Typography>
                    </Box>
                  )}
                  
                  {analysisType === 'risks' && (
                    <Box>
                      <Typography variant="subtitle1" color="primary.main" gutterBottom>
                        Identificación de Riesgos
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Este análisis identifica posibles riesgos o problemas en el documento, incluyendo:
                      </Typography>
                      <ul>
                        <Typography component="li" variant="body2">Cláusulas ambiguas</Typography>
                        <Typography component="li" variant="body2">Términos potencialmente desfavorables</Typography>
                        <Typography component="li" variant="body2">Obligaciones excesivas</Typography>
                        <Typography component="li" variant="body2">Ausencia de protecciones estándar</Typography>
                        <Typography component="li" variant="body2">Posibles conflictos con la legislación aplicable</Typography>
                        <Typography component="li" variant="body2">Inconsistencias internas</Typography>
                      </ul>
                      <Typography variant="body2">
                        Para cada riesgo identificado, se proporciona una explicación y sugerencias para mitigarlo.
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Resultados del análisis:
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <DocumentPreview>
                    {analysisResult}
                  </DocumentPreview>
                </Grid>
                
                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CloudDownloadIcon />}
                    onClick={handleDownload}
                    size="large"
                    sx={{ mr: 2 }}
                  >
                    Descargar Resultados
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setActiveTab(0)}
                  >
                    Nuevo Análisis
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </StyledPaper>
      </motion.div>
    </AnimatedContainer>
  );
};

export default DocumentAnalyzerPage;
