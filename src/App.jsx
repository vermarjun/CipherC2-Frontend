import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SessionsTab from './pages/dashboard/SessionsTab';
import OperatorsTab from './pages/dashboard/OperatorsTab';
import OperationsTab from './pages/dashboard/OperationsTab';
import ClientDetail from './pages/dashboard/ClientDetail';
import SessionDetail from './components/SessionDetail';
import FileExplorer from './components/Filesystem';
import UserActivityDashboard from './components/UserActivityDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import { DashboardProvider } from './context/DashboardContext';
import { AuthProvider } from './context/AuthContext';
import { UserActivityProvider } from './context/UserActivityContext';

function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <UserActivityProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes with layout */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              {/* Dashboard routes */}
              <Route path="/" element={<Navigate to="/dashboard/sessions" replace />} />
              <Route path="/dashboard" element={<Navigate to="/dashboard/sessions" replace />} />
              <Route path="/dashboard/sessions" element={<SessionsTab />} />
              <Route path="/dashboard/operators" element={<OperatorsTab />} />
              <Route path="/dashboard/operations" element={<OperationsTab />} />
              <Route path="/dashboard/activity" element={<UserActivityDashboard />} />
              <Route path="/dashboard/client/:clientId" element={<ClientDetail />} />
              <Route path="/session/:sessionId" element={<SessionDetail />} />
              <Route path="/filesystem/:sessionId" element={<FileExplorer />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </UserActivityProvider>
      </DashboardProvider>
    </AuthProvider>
  );
}

export default App;
