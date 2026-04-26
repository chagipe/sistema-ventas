import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Ventas from './pages/Ventas';
import Proveedores from './pages/Proveedores';
import Usuarios from './pages/Usuarios';
import Inventario from './pages/Inventario';
import Caja from './pages/Caja';
import Reportes from './pages/Reportes';
import { useTema } from './context/TemaContext';

function RutaProtegida({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function RutaAdmin({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (!localStorage.getItem('token')) return <Navigate to="/login" />;
  if (usuario.rol !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

export default function App() {
  const { oscuro } = useTema();

  return (
    <div className={oscuro ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
            <Route path="/productos" element={<RutaProtegida><Productos /></RutaProtegida>} />
            <Route path="/ventas" element={<RutaProtegida><Ventas /></RutaProtegida>} />
            <Route path="/inventario" element={<RutaProtegida><Inventario /></RutaProtegida>} />
            <Route path="/proveedores" element={<RutaAdmin><Proveedores /></RutaAdmin>} />
            <Route path="/usuarios" element={<RutaAdmin><Usuarios /></RutaAdmin>} />
            <Route path="/caja" element={<RutaAdmin><Caja /></RutaAdmin>} />
            <Route path="/reportes" element={<RutaAdmin><Reportes /></RutaAdmin>} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}