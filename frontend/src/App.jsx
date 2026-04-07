import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AvanceObra from './pages/AvanceObra';
import CurvaS from './pages/CurvaS';
import Suministros from './pages/Suministros';
import Restricciones from './pages/Restricciones';
import Configuracion from './pages/Configuracion';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/avance-obra" element={<ProtectedRoute><AvanceObra /></ProtectedRoute>} />
      <Route path="/curva-s" element={<ProtectedRoute><CurvaS /></ProtectedRoute>} />
      <Route path="/suministros" element={<ProtectedRoute><Suministros /></ProtectedRoute>} />
      <Route path="/restricciones" element={<ProtectedRoute><Restricciones /></ProtectedRoute>} />
      <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
