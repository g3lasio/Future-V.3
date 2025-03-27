const User = require('../models/userModel');
const logger = require('../utils/logger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Controlador para manejar suscripciones y pagos
 */
class SubscriptionController {
  /**
   * Obtiene todos los planes disponibles
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async getPlans(req, res) {
    try {
      // Definición de planes
      const plans = {
        free: {
          id: 'free',
          name: 'Gratuito',
          description: 'Ideal para usuarios ocasionales',
          monthlyPrice: 0,
          annualPrice: 0,
          features: [
            { name: 'Generación de documentos básicos', included: true },
            { name: 'Visualización de documentos', included: true },
            { name: 'Descarga de documentos', included: true },
            { name: 'Límite de 5 documentos por mes', included: true },
            { name: 'Análisis de documentos', included: false },
            { name: 'Edición de documentos', included: false },
            { name: 'Guardado de plantillas', included: false },
            { name: 'Acceso a API', included: false },
            { name: 'Soporte prioritario', included: false },
          ],
          limits: {
            documentsPerMonth: 5,
            documentsPerDay: 2,
            templateSaving: false,
            documentAnalysis: false,
            documentEditing: false
          }
        },
        premium: {
          id: 'premium',
          name: 'Premium',
          description: 'Perfecto para profesionales independientes',
          monthlyPrice: 29.99,
          annualPrice: 299.88, // 20% de descuento: 29.99 * 12 * 0.8
          features: [
            { name: 'Generación de documentos básicos', included: true },
            { name: 'Generación de documentos avanzados', included: true },
            { name: 'Visualización de documentos', included: true },
            { name: 'Descarga de documentos', included: true },
            { name: 'Análisis de documentos', included: true },
            { name: 'Edición de documentos', included: true },
            { name: 'Guardado de plantillas', included: true },
            { name: 'Límite de 50 documentos por mes', included: true },
            { name: 'Acceso a API', included: false },
            { name: 'Soporte prioritario', included: false },
          ],
          limits: {
            documentsPerMonth: 50,
            documentsPerDay: 10,
            templateSaving: true,
            documentAnalysis: true,
            documentEditing: true
          },
          stripeMonthlyPriceId: 'price_monthly_premium',
          stripeAnnualPriceId: 'price_annual_premium'
        },
        enterprise: {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'Ideal para empresas y equipos',
          monthlyPrice: 99.99,
          annualPrice: 999.88, // 20% de descuento: 99.99 * 12 * 0.8
          features: [
            { name: 'Generación de documentos básicos', included: true },
            { name: 'Generación de documentos avanzados', included: true },
            { name: 'Visualización de documentos', included: true },
            { name: 'Descarga de documentos', included: true },
            { name: 'Análisis de documentos', included: true },
            { name: 'Edición de documentos', included: true },
            { name: 'Guardado de plantillas', included: true },
            { name: 'Documentos ilimitados', included: true },
            { name: 'Acceso a API', included: true },
            { name: 'Soporte prioritario', included: true },
            { name: 'Acceso para equipos', included: true },
            { name: 'Personalización de plantillas', included: true },
          ],
          limits: {
            documentsPerMonth: -1, // ilimitado
            documentsPerDay: -1, // ilimitado
            templateSaving: true,
            documentAnalysis: true,
            documentEditing: true,
            apiAccess: true,
            prioritySupport: true,
            teamAccess: true
          },
          stripeMonthlyPriceId: 'price_monthly_enterprise',
          stripeAnnualPriceId: 'price_annual_enterprise'
        }
      };
      
      res.status(200).json({
        success: true,
        plans
      });
    } catch (error) {
      logger.error(`Error al obtener planes: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al obtener planes',
        error: error.message
      });
    }
  }
  
  /**
   * Obtiene la suscripción del usuario actual
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async getMySubscription(req, res) {
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
        subscription: user.subscription
      });
    } catch (error) {
      logger.error(`Error al obtener suscripción: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al obtener suscripción',
        error: error.message
      });
    }
  }
  
  /**
   * Crea una nueva suscripción
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async subscribe(req, res) {
    try {
      const { planId, billingCycle } = req.body;
      
      // Verificar si el plan es gratuito
      if (planId === 'free') {
        // Actualizar usuario con plan gratuito
        const user = await User.findByIdAndUpdate(
          req.user.id,
          {
            'subscription.plan': 'free',
            'subscription.status': 'active',
            'subscription.startDate': new Date(),
            'subscription.endDate': null, // Plan gratuito no tiene fecha de fin
            'subscription.billingCycle': null,
            'subscription.stripeCustomerId': null,
            'subscription.stripeSubscriptionId': null
          },
          { new: true }
        );
        
        return res.status(200).json({
          success: true,
          message: 'Suscripción al plan gratuito activada',
          subscription: user.subscription
        });
      }
      
      // Para planes pagados, necesitamos crear una sesión de pago con Stripe
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Determinar el ID de precio de Stripe según el plan y ciclo de facturación
      let stripePriceId;
      if (planId === 'premium') {
        stripePriceId = billingCycle === 'monthly' ? 'price_monthly_premium' : 'price_annual_premium';
      } else if (planId === 'enterprise') {
        stripePriceId = billingCycle === 'monthly' ? 'price_monthly_enterprise' : 'price_annual_enterprise';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Plan no válido'
        });
      }
      
      // Crear o recuperar cliente de Stripe
      let stripeCustomerId = user.subscription?.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id
          }
        });
        
        stripeCustomerId = customer.id;
      }
      
      // Crear sesión de pago
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
        metadata: {
          userId: user.id,
          planId: planId,
          billingCycle: billingCycle
        }
      });
      
      // Actualizar usuario con ID de cliente de Stripe
      await User.findByIdAndUpdate(
        req.user.id,
        {
          'subscription.stripeCustomerId': stripeCustomerId
        }
      );
      
      res.status(200).json({
        success: true,
        sessionId: session.id,
        url: session.url
      });
    } catch (error) {
      logger.error(`Error al crear suscripción: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al crear suscripción',
        error: error.message
      });
    }
  }
  
  /**
   * Cancela la suscripción actual
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async cancelSubscription(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Verificar si el usuario tiene una suscripción activa
      if (!user.subscription || !user.subscription.stripeSubscriptionId) {
        return res.status(400).json({
          success: false,
          message: 'No hay una suscripción activa para cancelar'
        });
      }
      
      // Cancelar suscripción en Stripe
      await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
      
      // Actualizar estado de suscripción en la base de datos
      user.subscription.status = 'canceling';
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Suscripción cancelada correctamente. Tendrás acceso hasta el final del período de facturación actual.',
        subscription: user.subscription
      });
    } catch (error) {
      logger.error(`Error al cancelar suscripción: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al cancelar suscripción',
        error: error.message
      });
    }
  }
  
  /**
   * Cambia el plan de suscripción
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async changePlan(req, res) {
    try {
      const { planId, billingCycle } = req.body;
      
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Verificar si el usuario tiene una suscripción activa
      if (!user.subscription || !user.subscription.stripeSubscriptionId) {
        // Si no tiene suscripción, crear una nueva
        return this.subscribe(req, res);
      }
      
      // Determinar el ID de precio de Stripe según el plan y ciclo de facturación
      let stripePriceId;
      if (planId === 'premium') {
        stripePriceId = billingCycle === 'monthly' ? 'price_monthly_premium' : 'price_annual_premium';
      } else if (planId === 'enterprise') {
        stripePriceId = billingCycle === 'monthly' ? 'price_monthly_enterprise' : 'price_annual_enterprise';
      } else if (planId === 'free') {
        // Cancelar suscripción actual y cambiar a plan gratuito
        await stripe.subscriptions.del(user.subscription.stripeSubscriptionId);
        
        // Actualizar usuario con plan gratuito
        user.subscription.plan = 'free';
        user.subscription.status = 'active';
        user.subscription.billingCycle = null;
        user.subscription.stripeSubscriptionId = null;
        await user.save();
        
        return res.status(200).json({
          success: true,
          message: 'Cambiado a plan gratuito correctamente',
          subscription: user.subscription
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Plan no válido'
        });
      }
      
      // Actualizar suscripción en Stripe
      const subscription = await stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId
      );
      
      await stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        {
          items: [
            {
              id: subscription.items.data[0].id,
              price: stripePriceId,
            },
          ],
          proration_behavior: 'create_prorations',
        }
      );
      
      // Actualizar información de suscripción en la base de datos
      user.subscription.plan = planId;
      user.subscription.billingCycle = billingCycle;
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Plan cambiado correctamente',
        subscription: user.subscription
      });
    } catch (error) {
      logger.error(`Error al cambiar plan: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar plan',
        error: error.message
      });
    }
  }
  
  /**
   * Maneja webhooks de Stripe
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async handleWebhook(req, res) {
    try {
      const sig = req.headers['stripe-signature'];
      let event;
      
      // Verificar firma del webhook
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        logger.error(`Error de firma de webhook: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      
      // Manejar eventos de Stripe
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          
          // Obtener información de la sesión
          const userId = session.metadata.userId;
          const planId = session.metadata.planId;
          const billingCycle = session.metadata.billingCycle;
          
          // Obtener detalles de la suscripción
          const subscriptionId = session.subscription;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Calcular fecha de fin según el ciclo de facturación
          const startDate = new Date(subscription.current_period_start * 1000);
          const endDate = new Date(subscription.current_period_end * 1000);
          
          // Actualizar usuario con información de suscripción
          await User.findByIdAndUpdate(
            userId,
            {
              'subscription.plan': planId,
              'subscription.status': 'active',
              'subscription.startDate': startDate,
              'subscription.endDate': endDate,
              'subscription.billingCycle': billingCycle,
              'subscription.stripeSubscriptionId': subscriptionId
            }
          );
          
          break;
        }
        
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          
          // Solo procesar si es una factura de suscripción
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const customerId = invoice.customer;
            
            // Buscar usuario por ID de cliente de Stripe
            const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
            
            if (user) {
              // Actualizar fechas de suscripción
              const startDate = new Date(subscription.current_period_start * 1000);
              const endDate = new Date(subscription.current_period_end * 1000);
              
              user.subscription.startDate = startDate;
              user.subscription.endDate = endDate;
              user.subscription.status = 'active';
              
              await user.save();
            }
          }
          
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          
          // Buscar usuario por ID de cliente de Stripe
          const user = await User.findOne({ 'subscription.stripeCustomerId': invoice.customer });
          
          if (user) {
            // Actualizar estado de suscripción
            user.subscription.status = 'past_due';
            await user.save();
          }
          
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          
          // Buscar usuario por ID de suscripción de Stripe
          const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
          
          if (user) {
            // Cambiar a plan gratuito
            user.subscription.plan = 'free';
            user.subscription.status = 'active';
            user.subscription.billingCycle = null;
            user.subscription.stripeSubscriptionId = null;
            user.subscription.endDate = null;
            
            await user.save();
          }
          
          break;
        }
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error(`Error al manejar webhook: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error al manejar webhook',
        error: error.message
      });
    }
  }
}

module.exports = new SubscriptionController();
