import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Grid, MenuItem, CircularProgress, Card, CardContent, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import TranslateIcon from '@mui/icons-material/Translate';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SaveIcon from '@mui/icons-material/Save';

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

// Componente de editor de documento
const DocumentEditor = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    background: 'rgba(10,10,10,0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
  },
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

const DocumentEditorPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [editType, setEditType] = useState('general');
  const [isDragActive, setIsDragActive] = useState(false);
  const [secondFile, setSecondFile] = useState(null);
  const [secondFileName, setSecondFileName] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  
  // Tipos de edición disponibles
  const editTypes = [
    { value: 'general', label: 'Edición General', icon: <EditIcon /> },
    { value: 'merge', label: 'Fusionar Documentos', icon: <MergeTypeIcon /> },
    { value: 'translate', label: 'Traducir Documento', icon: <TranslateIcon /> },
    { value: 'format', label: 'Reformatear Documento', icon: <FormatAlignLeftIcon /> },
  ];
  
  // Idiomas disponibles para traducción
  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'Inglés' },
    { value: 'fr', label: 'Francés' },
    { value: 'de', label: 'Alemán' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Portugués' },
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
      
      // Leer contenido del archivo
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setDocumentContent(content);
        setEditedContent(content);
      };
      reader.readAsText(uploadedFile);
    }
  };
  
  // Manejar carga del segundo archivo (para fusión)
  const handleSecondFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setSecondFile(uploadedFile);
      setSecondFileName(uploadedFile.name);
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
      
      // Leer contenido del archivo
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setDocumentContent(content);
        setEditedContent(content);
      };
      reader.readAsText(droppedFile);
    }
  };
  
  // Editar documento
  const editDocument = () => {
    if (!documentContent) return;
    
    setLoading(true);
    
    // Simulación de llamada a la API (en producción, esto sería una llamada real al backend)
    setTimeout(() => {
      let result = '';
      
      switch (editType) {
        case 'general':
          // Simulación de edición general
          result = documentContent + '\n\n/* EDICIONES APLICADAS:\n' + editInstructions + '\n*/';
          break;
        case 'merge':
          // Simulación de fusión de documentos
          result = `/* DOCUMENTO FUSIONADO */\n\n# Documento 1: ${fileName}\n\n${documentContent}\n\n# Documento 2: ${secondFileName || 'No seleccionado'}\n\n/* Aquí iría el contenido del segundo documento */\n\n/* INSTRUCCIONES DE FUSIÓN APLICADAS:\n${editInstructions || 'Ninguna'}\n*/`;
          break;
        case 'translate':
          // Simulación de traducción
          result = `/* DOCUMENTO TRADUCIDO AL ${targetLanguage === 'es' ? 'ESPAÑOL' : 
                                              targetLanguage === 'en' ? 'INGLÉS' : 
                                              targetLanguage === 'fr' ? 'FRANCÉS' : 
                                              targetLanguage === 'de' ? 'ALEMÁN' : 
                                              targetLanguage === 'it' ? 'ITALIANO' : 
                                              targetLanguage === 'pt' ? 'PORTUGUÉS' : 'IDIOMA SELECCIONADO'} */\n\n${documentContent}`;
          break;
        case 'format':
          // Simulación de reformateo
          result = `/* DOCUMENTO REFORMATEADO */\n\n${documentContent.split('\n').map(line => line.trim()).join('\n')}`;
          break;
        default:
          result = documentContent;
      }
      
      setEditedContent(result);
      setLoading(false);
      setActiveTab(1); // Cambiar a la pestaña de resultados
    }, 2000);
  };
  
  // Descargar documento editado
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([editedContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `editado_${fileName || 'documento'}_${new Date().toISOString().split('T')[0]}.txt`;
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
            Editor de Documentos
          </GradientTitle>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="body1" color="textSecondary">
            Edite, fusione y personalice documentos con nuestra interfaz intuitiva y asistencia inteligente.
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
            <StyledTab label="Editar" />
            <StyledTab label="Resultado" disabled={!editedContent} />
          </Tabs>
          
          {activeTab === 0 ? (
            <Box>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Seleccione un documento para editar
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
                    Tipo de edición
                  </Typography>
                  
                  <TextField
                    select
                    fullWidth
                    label="Seleccione el tipo de edición"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    variant="outlined"
                    margin="normal"
                    sx={{ mb: 4 }}
                  >
                    {editTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 1 }}>{option.icon}</Box>
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                  
                  {editType === 'merge' && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Seleccione el segundo documento para fusionar
                      </Typography>
                      
                      <input
                        type="file"
                        id="second-file-upload"
                        style={{ display: 'none' }}
                        onChange={handleSecondFileUpload}
                        accept=".pdf,.doc,.docx,.txt"
                      />
                      
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => document.getElementById('second-file-upload').click()}
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        Seleccionar segundo documento
                      </Button>
                      
                      {secondFileName && (
                        <Typography variant="body2" color="primary.main">
                          Segundo archivo: {secondFileName}
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  {editType === 'translate' && (
                    <TextField
                      select
                      fullWidth
                      label="Idioma destino"
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      variant="outlined"
                      margin="normal"
                      sx={{ mb: 4 }}
                    >
                      {languages.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                  
                  {(editType === 'general' || editType === 'merge' || editType === 'format') && (
                    <TextField
                      fullWidth
                      label={editType === 'general' ? "Instrucciones de edición" : 
                             editType === 'merge' ? "Instrucciones de fusión" :
                             "Instrucciones de formato"}
                      value={editInstructions}
                      onChange={(e) => setEditInstructions(e.target.value)}
                      variant="outlined"
                      margin="normal"
                      multiline
                      rows={4}
                      placeholder={editType === 'general' ? "Ej: Corregir errores gramaticales y mejorar la claridad" : 
                                  editType === 'merge' ? "Ej: Combinar manteniendo las cláusulas más favorables" :
                                  "Ej: Formato profesional con numeración de secciones"}
                      sx={{ mb: 4 }}
                    />
                  )}
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<EditIcon />}
                    onClick={editDocument}
                    disabled={!documentContent || (editType === 'merge' && !secondFile) || (editType === 'translate' && !targetLanguage) || loading}
                    fullWidth
                  >
                    {loading ? 'Procesando...' : 'Procesar Documento'}
                  </Button>
                  
                  {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <CircularProgress />
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Vista previa del documento
                  </Typography>
                  
                  <DocumentEditor
                    fullWidth
                    multiline
                    rows={20}
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    variant="outlined"
                    placeholder="El contenido del documento aparecerá aquí..."
                    InputProps={{
                      readOnly: false,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Documento editado:
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <DocumentEditor
                    fullWidth
                    multiline
                    rows={20}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    variant="outlined"
                  />
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
                    Descargar Documento
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={() => setActiveTab(0)}
                  >
                    Editar Nuevamente
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

export default DocumentEditorPage;
