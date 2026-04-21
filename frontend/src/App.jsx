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

function RutaProtegida({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/productos" element={<RutaProtegida><Productos /></RutaProtegida>} />
        <Route path="/ventas" element={<RutaProtegida><Ventas /></RutaProtegida>} />
        <Route path="/proveedores" element={<RutaProtegida><Proveedores /></RutaProtegida>} />
        <Route path="/usuarios" element={<RutaProtegida><Usuarios /></RutaProtegida>} />
        <Route path="/inventario" element={<RutaProtegida><Inventario /></RutaProtegida>} />
        <Route path="/caja" element={<RutaProtegida><Caja /></RutaProtegida>} />
        <Route path="/reportes" element={<RutaProtegida><Reportes /></RutaProtegida>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}