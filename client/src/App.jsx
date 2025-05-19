import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/Auth/adminLogin';
import AdminDashboard from './components/Admin/adminDashboard';
import ModelDashboard from './components/Admin/ModelDashboard';
import ModelTestPage from './components/ModelTest/ModelTestPage';
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/User/bubbleChart';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('userRole') === 'admin' && localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Dashboard isDarkMode={isDarkMode} />} />
        <Route path="/model-test" element={<ModelTestPage isDarkMode={isDarkMode} />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <AdminDashboard isDarkMode={isDarkMode} />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/model" element={
          <ProtectedRoute>
            <AdminLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
              <ModelDashboard isDarkMode={isDarkMode} />
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;