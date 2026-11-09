import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MessagesPage from './pages/MessagesPage';
import ClientProfilePage from './pages/ClientProfilePage';
import AgencyProfilePage from './pages/AgencyProfilePage';
import AgencyDashboard from './pages/AgencyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminStats from './components/admin/AdminStats';
import AdminUsers from './components/admin/AdminUsers';
import AdminProperties from './components/admin/AdminProperties';
import AdminReports from './components/admin/AdminReports';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/agency/dashboard"
          element={
            <ProtectedRoute requiredRole="PROFESSIONAL">
              <AgencyDashboard />
            </ProtectedRoute>
          }
        />

        {/* Routes Espace Administrateur */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminStats />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

