const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const logger = require('../utils/logger');
const supabaseService = require('../services/supabaseService');

/**
 * Controlador para manejar la autenticación de usuarios
 */
class AuthController {
  /**
   * Registra un nuevo usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async register(req, res) {
    try {
      const { name, email, password, phone, profileType, company } = req.body;
      
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }
      
      // Crear nuevo usuario
      const user = new User({
        name,
        email,
        password,
        phone,
        profileType,
        company,
        authProvider: 'local'
      });
      
      // Generar token de verificación de email
      const verificationToken = user.createVerificationToken();
      
      // Guardar usuario
      await user.save();
      
      // Enviar email de verificación (implementación pendiente)
      // await sendVerificationEmail(email, verificationToken);
      
      // Generar token JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
      
      // Responder con token y datos del usuario
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      logger.error(`Error al registrar usuario: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
        error: error.message
      });
    }
  }
  
  /**
   * Inicia sesión con email y contraseña
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Verificar si se proporcionaron email y contraseña
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Por favor proporcione email y contraseña'
        });
      }
      
      // Buscar usuario y seleccionar contraseña para comparación
      const user = await User.findOne({ email }).select('+password');
      
      // Verificar si el usuario existe
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      // Verificar si la contraseña es correcta
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      // Actualizar fecha de último inicio de sesión
      user.lastLogin = Date.now();
      await user.save();
      
      // Generar token JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
      
      // Responder con token y datos del usuario
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      logger.error(`Error al iniciar sesión: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      });
    }
  }
  
  /**
   * Inicia sesión con Apple ID
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async loginWithApple(req, res) {
    try {
      const { idToken, name } = req.body;
      
      // Verificar token de Apple (implementación pendiente)
      // const appleUser = await verifyAppleToken(idToken);
      const appleUser = { email: 'test@example.com', sub: '123456' }; // Simulación
      
      // Buscar usuario existente
      let user = await User.findOne({ 
        $or: [
          { email: appleUser.email },
          { authProvider: 'apple', providerId: appleUser.sub }
        ]
      });
      
      // Si el usuario no existe, crearlo
      if (!user) {
        user = new User({
          name: name || 'Usuario de Apple',
          email: appleUser.email,
          authProvider: 'apple',
          providerId: appleUser.sub,
          emailVerified: true // Apple verifica los emails
        });
        
        await user.save();
      } else if (user.authProvider !== 'apple') {
        // Actualizar usuario existente para usar Apple como proveedor
        user.authProvider = 'apple';
        user.providerId = appleUser.sub;
        await user.save();
      }
      
      // Actualizar fecha de último inicio de sesión
      user.lastLogin = Date.now();
      await user.save();
      
      // Generar token JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
      
      // Responder con token y datos del usuario
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      logger.error(`Error al iniciar sesión con Apple: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión con Apple',
        error: error.message
      });
    }
  }
  
  /**
   * Inicia sesión con GitHub
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async loginWithGithub(req, res) {
    try {
      const { code } = req.body;
      
      // Intercambiar código por token de acceso (implementación pendiente)
      // const accessToken = await exchangeGithubCode(code);
      const accessToken = 'github_token'; // Simulación
      
      // Obtener datos del usuario de GitHub (implementación pendiente)
      // const githubUser = await getGithubUser(accessToken);
      const githubUser = { email: 'test@github.com', id: '789012', name: 'GitHub User' }; // Simulación
      
      // Buscar usuario existente
      let user = await User.findOne({ 
        $or: [
          { email: githubUser.email },
          { authProvider: 'github', providerId: githubUser.id.toString() }
        ]
      });
      
      // Si el usuario no existe, crearlo
      if (!user) {
        user = new User({
          name: githubUser.name || 'Usuario de GitHub',
          email: githubUser.email,
          authProvider: 'github',
          providerId: githubUser.id.toString(),
          emailVerified: true // GitHub verifica los emails
        });
        
        await user.save();
      } else if (user.authProvider !== 'github') {
        // Actualizar usuario existente para usar GitHub como proveedor
        user.authProvider = 'github';
        user.providerId = githubUser.id.toString();
        await user.save();
      }
      
      // Actualizar fecha de último inicio de sesión
      user.lastLogin = Date.now();
      await user.save();
      
      // Generar token JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
      
      // Responder con token y datos del usuario
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      logger.error(`Error al iniciar sesión con GitHub: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión con GitHub',
        error: error.message
      });
    }
  }
  
  /**
   * Inicia el proceso de autenticación con teléfono
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async startPhoneAuth(req, res) {
    try {
      const { phone } = req.body;
      
      // Validar formato de teléfono
      if (!phone || !/^\+?[0-9]{8,15}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Por favor proporcione un número de teléfono válido'
        });
      }
      
      // Generar código de verificación
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Guardar código en base de datos (implementación pendiente)
      // En producción, esto debería usar un servicio como Firebase o Twilio
      // await saveVerificationCode(phone, verificationCode);
      
      // Enviar SMS con código (implementación pendiente)
      // await sendSMS(phone, `Su código de verificación para FutureLex es: ${verificationCode}`);
      
      // En desarrollo, devolver el código en la respuesta
      res.status(200).json({
        success: true,
        message: 'Código de verificación enviado',
        verificationCode // Solo para desarrollo
      });
    } catch (error) {
      logger.error(`Error al iniciar autenticación con teléfono: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar autenticación con teléfono',
        error: error.message
      });
    }
  }
  
  /**
   * Verifica el código de teléfono y completa la autenticación
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async verifyPhoneCode(req, res) {
    try {
      const { phone, code, name } = req.body;
      
      // Verificar código (implementación pendiente)
      // const isValid = await verifyCode(phone, code);
      const isValid = true; // Simulación
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Código de verificación inválido'
        });
      }
      
      // Buscar usuario existente
      let user = await User.findOne({ phone });
      
      // Si el usuario no existe, crearlo
      if (!user) {
        user = new User({
          name: name || 'Usuario',
          phone,
          authProvider: 'phone',
          phoneVerified: true
        });
        
        await user.save();
      } else {
        // Actualizar verificación de teléfono
        user.phoneVerified = true;
        await user.save();
      }
      
      // Actualizar fecha de último inicio de sesión
      user.lastLogin = Date.now();
      await user.save();
      
      // Generar token JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
      
      // Responder con token y datos del usuario
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          subscription: user.subscription
        }
      });
    } catch (error) {
      logger.error(`Error al verificar código de teléfono: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al verificar código de teléfono',
        error: error.message
      });
    }
  }
  
  /**
   * Obtiene el perfil del usuario actual
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileType: user.profileType,
          company: user.company,
          subscription: user.subscription,
          preferences: user.preferences,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          authProvider: user.authProvider,
          usageStats: user.usageStats,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      logger.error(`Error al obtener perfil: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message
      });
    }
  }
  
  /**
   * Actualiza el perfil del usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async updateProfile(req, res) {
    try {
      const { name, phone, profileType, company, preferences } = req.body;
      
      // Campos permitidos para actualización
      const updateData = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (profileType) updateData.profileType = profileType;
      if (company) updateData.company = company;
      if (preferences) updateData.preferences = preferences;
      
      // Actualizar usuario
      const user = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileType: user.profileType,
          company: user.company,
          subscription: user.subscription,
          preferences: user.preferences,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        }
      });
    } catch (error) {
      logger.error(`Error al actualizar perfil: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: error.message
      });
    }
  }
  
  /**
   * Cambia la contraseña del usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Verificar si se proporcionaron las contraseñas
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Por favor proporcione la contraseña actual y la nueva'
        });
      }
      
      // Buscar usuario y seleccionar contraseña para comparación
      const user = await User.findById(req.user.id).select('+password');
      
      // Verificar si el usuario existe
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Verificar si la contraseña actual es correcta
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }
      
      // Actualizar contraseña
      user.password = newPassword;
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      logger.error(`Error al cambiar contraseña: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar contraseña',
        error: error.message
      });
    }
  }
  
  /**
   * Solicita restablecimiento de contraseña
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      // Verificar si se proporcionó email
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Por favor proporcione su email'
        });
      }
      
      // Buscar usuario
      const user = await User.findOne({ email });
      
      // Si el usuario no existe, responder con éxito para no revelar información
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'Si el email está registrado, recibirá instrucciones para restablecer su contraseña'
        });
      }
      
      // Generar token de restablecimiento
      const resetToken = user.createPasswordResetToken();
      await user.save();
      
      // Enviar email con token (implementación pendiente)
      // await sendPasswordResetEmail(email, resetToken);
      
      res.status(200).json({
        success: true,
        message: 'Si el email está registrado, recibirá instrucciones para restablecer su contraseña',
        resetToken // Solo para desarrollo
      });
    } catch (error) {
      logger.error(`Error al solicitar restablecimiento de contraseña: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al solicitar restablecimiento de contraseña',
        error: error.message
      });
    }
  }
  
  /**
   * Restablece la contraseña con token
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      
      // Verificar si se proporcionaron token y contraseña
      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: 'Por favor proporcione el token y la nueva contraseña'
        });
      }
      
      // Encriptar token para comparación
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      // Buscar usuario con token válido
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
      });
      
      // Verificar si el token es válido
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
      }
      
      // Actualizar contraseña y limpiar tokens
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Contraseña restablecida correctamente'
      });
    } catch (error) {
      logger.error(`Error al restablecer contraseña: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al restablecer contraseña',
        error: error.message
      });
    }
  }
  
  /**
   * Verifica el email del usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      
      // Encriptar token para comparación
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      // Buscar usuario con token válido
      const user = await User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpire: { $gt: Date.now() }
      });
      
      // Verificar si el token es válido
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
      }
      
      // Actualizar verificación y limpiar tokens
      user.emailVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpire = undefined;
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Email verificado correctamente'
      });
    } catch (error) {
      logger.error(`Error al verificar email: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al verificar email',
        error: error.message
      });
    }
  }
  
  /**
   * Reenvía el email de verificación
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async resendVerificationEmail(req, res) {
    try {
      // Buscar usuario
      const user = await User.findById(req.user.id);
      
      // Verificar si el usuario existe
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Verificar si el email ya está verificado
      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está verificado'
        });
      }
      
      // Generar nuevo token de verificación
      const verificationToken = user.createVerificationToken();
      await user.save();
      
      // Enviar email de verificación (implementación pendiente)
      // await sendVerificationEmail(user.email, verificationToken);
      
      res.status(200).json({
        success: true,
        message: 'Email de verificación reenviado',
        verificationToken // Solo para desarrollo
      });
    } catch (error) {
      logger.error(`Error al reenviar email de verificación: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al reenviar email de verificación',
        error: error.message
      });
    }
  }
  
  /**
   * Cierra la sesión del usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async logout(req, res) {
    try {
      // En una implementación JWT, no es necesario hacer nada en el servidor
      // El cliente debe eliminar el token
      
      res.status(200).json({
        success: true,
        message: 'Sesión cerrada correctamente'
      });
    } catch (error) {
      logger.error(`Error al cerrar sesión: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al cerrar sesión',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
