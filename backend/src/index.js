const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

// Importar middleware
const errorHandler = require('./middleware/errorHandler');

// Inicializar app
const app = express();

// Configurar middleware
app.use(helmet()); // Seguridad HTTP
app.use(compression()); // Compresión de respuestas
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 solicitudes por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo después de 15 minutos'
});
app.use('/api/', limiter);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Ruta de estado
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API funcionando correctamente',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  // Servir archivos estáticos
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Manejar rutas SPA
  app.get('*', (req, res) => {
    if (req.url.startsWith('/api')) {
      return res.status(404).json({
        status: 'error',
        message: 'Ruta de API no encontrada'
      });
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});

module.exports = app;
