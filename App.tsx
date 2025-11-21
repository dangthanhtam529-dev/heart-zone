import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MoodProvider } from './context/MoodContext';
import { ReportProvider } from './context/ReportContext';
import { Layout } from './components/Layout';
import { CreateMood } from './pages/CreateMood';
import { MoodList } from './pages/MoodList';
import { MoodTrends } from './pages/MoodTrends';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MoodProvider>
        <ReportProvider>
          <HashRouter>
            <Layout>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <CreateMood />
                  </ProtectedRoute>
                } />
                <Route path="/list" element={
                  <ProtectedRoute>
                    <MoodList />
                  </ProtectedRoute>
                } />
                <Route path="/trend" element={
                  <ProtectedRoute>
                    <MoodTrends />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </HashRouter>
        </ReportProvider>
      </MoodProvider>
    </AuthProvider>
  );
};

export default App;