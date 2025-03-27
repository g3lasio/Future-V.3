const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trial'],
    default: 'active'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer', 'none'],
    default: 'none'
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  paymentDetails: {
    type: Object,
    default: {}
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor proporcione su nombre']
  },
  email: {
    type: String,
    required: [true, 'Por favor proporcione su email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor proporcione un email válido']
  },
  phone: {
    type: String,
    match: [/^\+?[0-9]{8,15}$/, 'Por favor proporcione un número de teléfono válido']
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profileType: {
    type: String,
    enum: ['individual', 'business'],
    default: 'individual'
  },
  company: {
    name: String,
    position: String,
    industry: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  subscription: {
    type: subscriptionSchema,
    default: () => ({})
  },
  preferences: {
    language: {
      type: String,
      default: 'es'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    theme: {
      type: String,
      default: 'dark'
    }
  },
  authProvider: {
    type: String,
    enum: ['local', 'apple', 'github', 'phone'],
    default: 'local'
  },
  providerId: String,
  documentCount: {
    type: Number,
    default: 0
  },
  usageStats: {
    documentsGenerated: {
      type: Number,
      default: 0
    },
    documentsAnalyzed: {
      type: Number,
      default: 0
    },
    documentsEdited: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  }
});

// Middleware para encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Solo encriptar si la contraseña ha sido modificada o es nueva
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    // Generar salt
    const salt = await bcrypt.genSalt(10);
    
    // Encriptar contraseña
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para generar token de restablecimiento de contraseña
userSchema.methods.createPasswordResetToken = function() {
  // Generar token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Encriptar token y guardarlo en la base de datos
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Establecer expiración (10 minutos)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Método para generar token de verificación de email
userSchema.methods.createVerificationToken = function() {
  // Generar token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Encriptar token y guardarlo en la base de datos
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Establecer expiración (24 horas)
  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

// Método para verificar si la suscripción está activa
userSchema.methods.hasActiveSubscription = function() {
  if (!this.subscription || !this.subscription.plan) {
    return false;
  }
  
  // Plan gratuito siempre está activo
  if (this.subscription.plan === 'free') {
    return true;
  }
  
  // Verificar estado y fecha de expiración
  return (
    this.subscription.status === 'active' &&
    (!this.subscription.endDate || new Date(this.subscription.endDate) > new Date())
  );
};

// Método para verificar si el usuario puede acceder a una característica
userSchema.methods.canAccess = function(feature) {
  if (!this.hasActiveSubscription()) {
    return false;
  }
  
  const featureAccess = {
    // Características disponibles para plan gratuito
    free: [
      'generate_basic_documents',
      'view_documents',
      'download_documents'
    ],
    
    // Características disponibles para plan premium
    premium: [
      'generate_basic_documents',
      'generate_advanced_documents',
      'analyze_documents',
      'edit_documents',
      'view_documents',
      'download_documents',
      'save_templates'
    ],
    
    // Características disponibles para plan enterprise
    enterprise: [
      'generate_basic_documents',
      'generate_advanced_documents',
      'analyze_documents',
      'edit_documents',
      'view_documents',
      'download_documents',
      'save_templates',
      'team_access',
      'api_access',
      'priority_support'
    ]
  };
  
  return featureAccess[this.subscription.plan].includes(feature);
};

// Método para actualizar estadísticas de uso
userSchema.methods.updateUsageStats = function(action) {
  if (!this.usageStats) {
    this.usageStats = {
      documentsGenerated: 0,
      documentsAnalyzed: 0,
      documentsEdited: 0
    };
  }
  
  switch (action) {
    case 'generate':
      this.usageStats.documentsGenerated += 1;
      this.documentCount += 1;
      break;
    case 'analyze':
      this.usageStats.documentsAnalyzed += 1;
      break;
    case 'edit':
      this.usageStats.documentsEdited += 1;
      break;
  }
  
  this.usageStats.lastActivity = Date.now();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
