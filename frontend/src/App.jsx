import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { Home } from './pages/Home';
import { CoursesList } from './pages/CoursesList';
import { CourseDetail } from './pages/CourseDetail';
import { LessonViewer } from './pages/LessonViewer';
import { QuizTake } from './pages/QuizTake';
import { AssignmentDetail } from './pages/AssignmentDetail';
import { CertificateView } from './pages/CertificateView';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<CoursesList />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route
                  path="/courses/:courseId/lessons/:lessonId"
                  element={
                    <ProtectedRoute>
                      <LessonViewer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quizzes/:id"
                  element={
                    <ProtectedRoute>
                      <QuizTake />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assignments/:id"
                  element={
                    <ProtectedRoute>
                      <AssignmentDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/certificate/:courseId"
                  element={
                    <ProtectedRoute>
                      <CertificateView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
};

export default App;
