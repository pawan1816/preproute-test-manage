import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTest from './pages/CreateTest';
import AddQuestions from './pages/AddQuestions';
import PreviewPublish from './pages/PreviewPublish';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuthStore } from './store';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/new"
          element={
            <ProtectedRoute>
              <CreateTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/:id/edit"
          element={
            <ProtectedRoute>
              <CreateTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/:id/questions"
          element={
            <ProtectedRoute>
              <AddQuestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/:id/preview"
          element={
            <ProtectedRoute>
              <PreviewPublish />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;