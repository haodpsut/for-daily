import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProgramProvider } from './contexts/ProgramContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import POs from './pages/POs';
import PLOs from './pages/PLOs';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Outputs from './pages/Outputs';
import ImportExcel from './pages/ImportExcel';
import Impact from './pages/Impact';
import Measurement from './pages/Measurement';
import MeasurementDetail from './pages/MeasurementDetail';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-8 text-gray-500">Đang xác thực...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProgramProvider>
                  <Layout />
                </ProgramProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<POs />} />
            <Route path="plos" element={<PLOs />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="import" element={<ImportExcel />} />
            <Route path="impact" element={<Impact />} />
            <Route path="measurement" element={<Measurement />} />
            <Route path="measurement/:id" element={<MeasurementDetail />} />
            <Route path="outputs" element={<Outputs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
