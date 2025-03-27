const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');

/**
 * Middleware para manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Error interno del servidor';
  
  // Log del error
  logger.error(`${status} - ${message}`, { 
    error: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'no autenticado'
  });
  
  // Respuesta al cliente
  res.status(status).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Clase para errores personalizados de la API
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
  
  static badRequest(message = 'Solicitud incorrecta') {
    return new ApiError(message, StatusCodes.BAD_REQUEST);
  }
  
  static unauthorized(message = 'No autorizado') {
    return new ApiError(message, StatusCodes.UNAUTHORIZED);
  }
  
  static forbidden(message = 'Acceso prohibido') {
    return new ApiError(message, StatusCodes.FORBIDDEN);
  }
  
  static notFound(message = 'Recurso no encontrado') {
    return new ApiError(message, StatusCodes.NOT_FOUND);
  }
  
  static conflict(message = 'Conflicto con el estado actual') {
    return new ApiError(message, StatusCodes.CONFLICT);
  }
  
  static internal(message = 'Error interno del servidor') {
    return new ApiError(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  errorHandler,
  ApiError
};
