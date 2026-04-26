import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart,
  ClipboardList, Users, Wallet, LogOut, Store, Truck, BarChart2, Menu, X
} from 'lucide-react';

const menuAdmin = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Productos', path: '/productos' },
  { icon: ShoppingCart, label: 'Ventas', path: '/ventas' },
  { icon: ClipboardList, label: 'Inventario', path: '/inventario' },
  { icon: Truck, label: 'Proveedores', path: '/proveedores' },
  { icon: Users, label: 'Usuarios', path: '/usuarios' },
  { icon: Wallet, label: 'Caja', path: '/caja' },
  { icon: BarChart2, label: 'Reportes', path: '/reportes' },
];

const menuVendedor = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Productos', path: '/productos' },
  { icon: ShoppingCart, label: 'Ventas', path: '/ventas' },
  { icon: ClipboardList, label: 'Inventario', path: '/inventario' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const menu = usuario.rol === 'admin' ? menuAdmin : menuVendedor;
  const [abierto, setAbierto] = useState(false);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const navegar = (path) => {
    navigate(path);
    setAbierto(false);
  };

  return (
    <>
      {/* Botón hamburguesa — solo en móvil */}
      <button
        onClick={() => setAbierto(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg text-white"
      >
        <Menu size={20} />
      </button>

      {/* Overlay — solo en móvil cuando está abierto */}
      {abierto && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setAbierto(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-60 bg-slate-900 dark:bg-slate-950 flex flex-col z-50
        transition-transform duration-300
        ${abierto ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Store size={18} color="white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">SistemaVentas</span>
          </div>
          {/* Botón cerrar — solo en móvil */}
          <button onClick={() => setAbierto(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const activo = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navegar(item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-left transition-all duration-150 ${
                  activo
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Cerrar sesión */}
        <div className="px-3 py-4 border-t border-slate-700 dark:border-slate-800">
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-left text-slate-400 hover:bg-red-600 hover:text-white transition-all duration-150"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}