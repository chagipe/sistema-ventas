import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart,
  ClipboardList, Users, Wallet, LogOut, Store, Truck
} from 'lucide-react';

const menu = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Productos', path: '/productos' },
  { icon: ShoppingCart, label: 'Ventas', path: '/ventas' },
  { icon: Truck, label: 'Proveedores', path: '/proveedores' },
  { icon: ClipboardList, label: 'Inventario', path: '/inventario' },
  { icon: Users, label: 'Usuarios', path: '/usuarios' },
  { icon: Wallet, label: 'Caja', path: '/caja' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-60 bg-slate-900 flex flex-col z-50">
      
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Store size={18} color="white" />
        </div>
        <span className="text-white font-semibold text-sm tracking-wide">SistemaVentas</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const activo = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
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
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-left text-slate-400 hover:bg-red-600 hover:text-white transition-all duration-150"
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}