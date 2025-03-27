import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Crear contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Configurar token en headers por defecto
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verificar token con el backend
        const response = await axios.get('/api/auth/verify-token');
        
        if (response.data.success) {
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
          
          // Obtener información de suscripción
          try {
            const subscriptionResponse = await axios.get('/api/subscriptions/my-subscription');
            if (subscriptionResponse.data.success) {
              setSubscription(subscriptionResponse.data.subscription);
            }
          } catch (error) {
            console.error('Error al obtener información de suscripción:', error);
          }
        } else {
          // Token inválido, limpiar localStorage
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
        // En caso de error, limpiar localStorage
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, []);
  
  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Guardar token en localStorage
        localStorage.setItem('token', token);
        
        // Configurar token en headers por defecto
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Actualizar estado
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Obtener información de suscripción
        try {
          const subscriptionResponse = await axios.get('/api/subscriptions/my-subscription');
          if (subscriptionResponse.data.success) {
            setSubscription(subscriptionResponse.data.subscription);
          }
        } catch (error) {
          console.error('Error al obtener información de suscripción:', error);
        }
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Error al iniciar sesión' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };
  
  // Función para iniciar sesión con proveedores externos
  const loginWithProvider = async (provider, data) => {
    try {
      const response = await axios.post(`/api/auth/login/${provider}`, data);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Guardar token en localStorage
        localStorage.setItem('token', token);
        
        // Configurar token en headers por defecto
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Actualizar estado
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Obtener información de suscripción
        try {
          const subscriptionResponse = await axios.get('/api/subscriptions/my-subscription');
          if (subscriptionResponse.data.success) {
            setSubscription(subscriptionResponse.data.subscription);
          }
        } catch (error) {
          console.error('Error al obtener información de suscripción:', error);
        }
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.data.message || `Error al iniciar sesión con ${provider}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || `Error al iniciar sesión con ${provider}` 
      };
    }
  };
  
  // Función para registrarse
  const signup = async (userData) => {
    try {
      const response = await axios.post('/api/auth/signup', userData);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Guardar token en localStorage
        localStorage.setItem('token', token);
        
        // Configurar token en headers por defecto
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Actualizar estado
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Inicializar suscripción gratuita
        setSubscription({
          plan: 'free',
          status: 'active',
          startDate: new Date(),
          endDate: null
        });
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Error al registrarse' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al registrarse' 
      };
    }
  };
  
  // Función para cerrar sesión
  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    
    // Limpiar headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Actualizar estado
    setCurrentUser(null);
    setIsAuthenticated(false);
    setSubscription(null);
  };
  
  // Función para actualizar perfil
  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/api/users/profile', userData);
      
      if (response.data.success) {
        // Actualizar estado
        setCurrentUser(response.data.user);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Error al actualizar perfil' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al actualizar perfil' 
      };
    }
  };
  
  // Función para actualizar suscripción
  const updateSubscription = async () => {
    try {
      const response = await axios.get('/api/subscriptions/my-subscription');
      
      if (response.data.success) {
        setSubscription(response.data.subscription);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Error al actualizar suscripción' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al actualizar suscripción' 
      };
    }
  };
  
  // Verificar si el usuario tiene acceso a una característica según su plan
  const hasAccess = (feature) => {
    if (!subscription) return false;
    
    const planLimits = {
      free: {
        documentGeneration: true,
        documentViewing: true,
        documentDownload: true,
        documentAnalysis: false,
        documentEditing: false,
        templateSaving: false,
        apiAccess: false,
        prioritySupport: false
      },
      premium: {
        documentGeneration: true,
        documentViewing: true,
        documentDownload: true,
        documentAnalysis: true,
        documentEditing: true,
        templateSaving: true,
        apiAccess: false,
        prioritySupport: false
      },
      enterprise: {
        documentGeneration: true,
        documentViewing: true,
        documentDownload: true,
        documentAnalysis: true,
        documentEditing: true,
        templateSaving: true,
        apiAccess: true,
        prioritySupport: true
      }
    };
    
    const plan = subscription.plan || 'free';
    return planLimits[plan][feature] || false;
  };
  
  // Valor del contexto
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    subscription,
    login,
    loginWithProvider,
    signup,
    logout,
    updateProfile,
    updateSubscription,
    hasAccess
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
