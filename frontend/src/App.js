import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Componentes de layout
import Layout from './components/Layout/Layout';

// Páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DocumentGeneratorPage from './pages/DocumentGeneratorPage';
import DocumentAnalyzerPage from './pages/DocumentAnalyzerPage';
import DocumentEditorPage from './pages/DocumentEditorPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import PaymentPage from './pages/PaymentPage';
import SubscriptionResultPage from './pages/SubscriptionResultPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

// Contexto de autenticación
import { AuthProvider, useAuth } from './context/AuthContext';

// Tema
import theme from './styles/theme';

// Componente de fondo animado
import BackgroundAnimation from './components/UI/BackgroundAnimation';

// Ruta protegida que requiere autenticación
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</Box>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <BackgroundAnimation />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              
              {/* Rutas protegidas */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="document/generate" element={
                <ProtectedRoute>
                  <DocumentGeneratorPage />
                </ProtectedRoute>
              } />
              <Route path="document/analyze" element={
                <ProtectedRoute>
                  <DocumentAnalyzerPage />
                </ProtectedRoute>
              } />
              <Route path="document/edit" element={
                <ProtectedRoute>
                  <DocumentEditorPage />
                </ProtectedRoute>
              } />
              <Route path="subscription/plans" element={
                <ProtectedRoute>
                  <SubscriptionPlansPage />
                </ProtectedRoute>
              } />
              <Route path="subscription/payment" element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } />
              <Route path="subscription/success" element={
                <ProtectedRoute>
                  <SubscriptionResultPage />
                </ProtectedRoute>
              } />
              <Route path="subscription/cancel" element={
                <ProtectedRoute>
                  <SubscriptionPlansPage />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
