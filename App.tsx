import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MoodProvider } from './context/MoodContext';
import { ReportProvider } from './context/ReportContext';
import { Layout } from './components/Layout';

// Lazy load larger components - using correct named export imports
const CreateMood = lazy(() => import('./pages/CreateMood').then(({ CreateMood }) => ({ default: CreateMood })));
const MoodList = lazy(() => import('./pages/MoodList').then(({ MoodList }) => ({ default: MoodList })));
const MoodTrends = lazy(() => import('./pages/MoodTrends').then(({ MoodTrends }) => ({ default: MoodTrends })));
const Login = lazy(() => import('./pages/Login').then(({ Login }) => ({ default: Login })));
const Register = lazy(() => import('./pages/Register').then(({ Register }) => ({ default: Register })));
const Profile = lazy(() => import('./pages/Profile').then(({ Profile }) => ({ default: Profile })));

// Loading component for lazy loading
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-stone-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
  </div>
);

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
              <Suspense fallback={<LoadingSpinner />}>
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
              </Suspense>
            </Layout>
          </HashRouter>
        </ReportProvider>
      </MoodProvider>
    </AuthProvider>
  );
};

export default App;