import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientProfilePage from './pages/ClientProfilePage';
import AgencyProfilePage from './pages/AgencyProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile/client"
          element={
            <ProtectedRoute requiredRole="CLIENT">
              <ClientProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/agency"
          element={
            <ProtectedRoute requiredRole="PROFESSIONAL">
              <AgencyProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
