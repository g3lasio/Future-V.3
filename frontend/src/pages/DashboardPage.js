import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [userStats, setUserStats] = useState({
    documentsCreated: 0,
    documentsAnalyzed: 0,
    documentsEdited: 0
  });

  useEffect(() => {
    // Aquí se cargarían los datos del usuario y sus documentos desde la API
    // Por ahora usamos datos de ejemplo
    setRecentDocuments([
      { id: 1, title: 'Contrato de Arrendamiento', date: '2023-10-15', type: 'Legal' },
      { id: 2, title: 'Acuerdo de Confidencialidad', date: '2023-10-10', type: 'Legal' },
      { id: 3, title: 'Propuesta de Negocio', date: '2023-10-05', type: 'No Legal' }
    ]);

    setUserStats({
      documentsCreated: 12,
      documentsAnalyzed: 5,
      documentsEdited: 8
    });
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Acciones rápidas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Acciones Rápidas
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate('/document/generate')}
              sx={{ py: 2 }}
            >
              Generar Documento
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate('/document/analyze')}
              sx={{ py: 2 }}
            >
              Analizar Documento
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate('/document/edit')}
              sx={{ py: 2 }}
            >
              Editar Documento
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Estadísticas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Estadísticas
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h4">{userStats.documentsCreated}</Typography>
              <Typography variant="body1">Documentos Creados</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h4">{userStats.documentsAnalyzed}</Typography>
              <Typography variant="body1">Documentos Analizados</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h4">{userStats.documentsEdited}</Typography>
              <Typography variant="body1">Documentos Editados</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Documentos recientes */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Documentos Recientes
        </Typography>
        <Grid container spacing={3}>
          {recentDocuments.map(doc => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{doc.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tipo: {doc.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fecha: {doc.date}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/document/edit?id=${doc.id}`)}>
                    Editar
                  </Button>
                  <Button size="small">Ver</Button>
                  <Button size="small">Descargar</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;