const User = require('../models/userModel');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Controlador para la gestión de usuarios
 */
const userController = {
  /**
   * Obtiene todos los usuarios (solo para administradores)
   */
  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Aplicar filtros si existen
      const filter = {};
      if (req.query.profileType) {
        filter.profileType = req.query.profileType;
      }
      
      if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
      }
      
      const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await User.countDocuments(filter);
      
      res.status(200).json({
        success: true,
        count: users.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: users
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Obtiene un usuario por su ID (solo para administradores)
   */
  async getUserById(req, res, next) {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        throw ApiError.notFound('Usuario no encontrado');
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Actualiza un usuario (solo para administradores)
   */
  async updateUser(req, res, next) {
    try {
      const { name, email, role, profileType, company, isActive, subscription } = req.body;
      
      // Crear objeto con campos a actualizar
      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (role) updateFields.role = role;
      if (profileType) updateFields.profileType = profileType;
      if (company) updateFields.company = company;
      if (isActive !== undefined) updateFields.isActive = isActive;
      if (subscription) updateFields.subscription = subscription;
      
      // Actualizar usuario
      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true, runValidators: true }
      );
      
      if (!user) {
        throw ApiError.notFound('Usuario no encontrado');
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Elimina un usuario (solo para administradores)
   */
  async deleteUser(req, res, next) {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        throw ApiError.notFound('Usuario no encontrado');
      }
      
      await user.remove();
      
      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Activa o desactiva un usuario (solo para administradores)
   */
  async toggleUserStatus(req, res, next) {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        throw ApiError.notFound('Usuario no encontrado');
      }
      
      // Cambiar estado
      user.isActive = !user.isActive;
      await user.save();
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Obtiene los detalles de suscripción del usuario actual
   */
  async getSubscriptionDetails(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        throw ApiError.notFound('Usuario no encontrado');
      }
      
      res.status(200).json({
        success: true,
        data: user.subscription
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Actualiza la suscripción del usuario actual
   */
  async upgradeSubscription(req, res, next) {
    try {
      const { plan, paymentMethod } = req.body;
      
      if (!plan) {
        throw ApiError.badRequest('El plan de suscripción es requerido');
      }
      
      const user = await User.findById(req.user.id);
      
      if (!user) {
        throw ApiError.notFound('Usuario no encontrado');
      }
      
      // Calcular fechas de suscripción
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Suscripción mensual por defecto
      
      // Actualizar suscripción
      user.subscription = {
        plan,
        startDate,
        endDate,
        status: 'active',
        paymentMethod: paymentMethod || 'credit_card'
      };
      
      await user.save();
      
      res.status(200).json({
        success: true,
        data: user.subscription
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Cancela la suscripción del usuario actual
   */
  async cancelSubscription(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        throw ApiError.notFound('Usuario no encontrado');
      }
      
      // Actualizar estado de suscripción
      user.subscription.status = 'cancelled';
      await user.save();
      
      res.status(200).json({
        success: true,
        data: user.subscription
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Actualiza el método de pago del usuario actual
   */
  async updatePaymentMethod(req, res, next) {
    try {
      const { paymentMethod } = req.body;
      
      if (!paymentMethod) {
        throw ApiError.badRequest('El método de pago es requerido');
      }
      
      const user = await User.findById(req.user.id);
      
      if (!user) {
        throw ApiError.notFound('Usuario no encontrado');
      }
      
      // Actualizar método de pago
      user.subscription.paymentMethod = paymentMethod;
      await user.save();
      
      res.status(200).json({
        success: true,
        data: user.subscription
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
