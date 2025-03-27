const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const logger = require('../utils/logger');

/**
 * Middleware para manejar la autenticación y autorización
 */
class AuthMiddleware {
  /**
   * Protege rutas que requieren autenticación
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Función para continuar al siguiente middleware
   */
  async protect(req, res, next) {
    try {
      let token;
      
      // Verificar si hay token en los headers
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      }
      
      // Verificar si el token existe
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No está autorizado para acceder a este recurso'
        });
      }
      
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuario
      const user = await User.findById(decoded.id);
      
      // Verificar si el usuario existe
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'El usuario asociado a este token ya no existe'
        });
      }
      
      // Añadir usuario a la solicitud
      req.user = user;
      next();
    } catch (error) {
      logger.error(`Error en middleware de autenticación: ${error.message}`);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error en la autenticación',
        error: error.message
      });
    }
  }
  
  /**
   * Restringe acceso a roles específicos
   * @param  {...String} roles - Roles permitidos
   * @returns {Function} Middleware
   */
  restrictTo(...roles) {
    return (req, res, next) => {
      // Verificar si el usuario tiene el rol requerido
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permiso para realizar esta acción'
        });
      }
      
      next();
    };
  }
  
  /**
   * Verifica si el usuario tiene una suscripción activa
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Función para continuar al siguiente middleware
   */
  checkSubscription(req, res, next) {
    // Verificar si el usuario tiene una suscripción activa
    if (!req.user.hasActiveSubscription()) {
      return res.status(403).json({
        success: false,
        message: 'Se requiere una suscripción activa para acceder a este recurso'
      });
    }
    
    next();
  }
  
  /**
   * Verifica si el usuario puede acceder a una característica específica
   * @param {String} feature - Característica a verificar
   * @returns {Function} Middleware
   */
  checkFeatureAccess(feature) {
    return (req, res, next) => {
      // Verificar si el usuario puede acceder a la característica
      if (!req.user.canAccess(feature)) {
        return res.status(403).json({
          success: false,
          message: `Su plan actual no incluye acceso a esta característica: ${feature}`
        });
      }
      
      next();
    };
  }
  
  /**
   * Verifica si el email del usuario está verificado
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Función para continuar al siguiente middleware
   */
  checkEmailVerified(req, res, next) {
    // Verificar si el email del usuario está verificado
    if (!req.user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Se requiere verificar su email para acceder a este recurso'
      });
    }
    
    next();
  }
}

module.exports = new AuthMiddleware();
