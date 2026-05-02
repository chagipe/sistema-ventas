import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTema } from '../context/TemaContext';
import api from '../services/api';

export default function Navbar({ titulo }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [alertas, setAlertas] = useState([]);
  const [mostrarAlertas, setMostrarAlertas] = useState(false);
  const { oscuro, toggleTema } = useTema();
  const navigate = useNavigate();

  useEffect(() => {
    cargarAlertas();
    const intervalo = setInterval(cargarAlertas, 60000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarAlertas = async () => {
    try {
      const res = await api.get('/productos');
      const bajos = res.data.filter(p => p.stock <= p.stock_minimo);
      setAlertas(bajos);
    } catch {}
  };

  return (
    <div className="fixed top-0 left-0 lg:left-60 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 z-40">

      {/* Título — con margen en móvil para el botón hamburguesa */}
      <h1 className="text-slate-800 dark:text-white font-semibold text-lg ml-10 lg:ml-0">{titulo}</h1>

      {/* Derecha */}
      <div className="flex items-center gap-2 lg:gap-4">

        {/* Buscador — oculto en móvil */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none w-32 lg:w-40 placeholder-slate-400"
          />
        </div>

        {/* Toggle tema */}
        <button onClick={toggleTema} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          {oscuro ? <Sun size={18} className="text-slate-400" /> : <Moon size={18} className="text-slate-500" />}
        </button>

        {/* Notificaciones */}
        <div className="relative">
          <button onClick={() => setMostrarAlertas(!mostrarAlertas)} className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <Bell size={18} className="text-slate-500 dark:text-slate-400" />
            {alertas.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {alertas.length}
              </span>
            )}
          </button>

          {mostrarAlertas && (
            <div className="absolute right-0 top-12 w-72 lg:w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-white text-sm">Alertas de stock</p>
                <p className="text-xs text-slate-400 mt-0.5">{alertas.length} productos con stock bajo</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {alertas.length === 0 ? (
                  <div className="px-4 py-6 text-center text-slate-400 text-sm">No hay alertas</div>
                ) : (
                  alertas.map(p => (
                    <div key={p.id} onClick={() => { navigate('/inventario'); setMostrarAlertas(false); }}
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{p.nombre}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                          {p.stock === 0 ? 'Sin stock' : `Stock: ${p.stock}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Mínimo requerido: {p.stock_minimo} unid.</p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => { navigate('/inventario'); setMostrarAlertas(false); }} className="text-xs text-blue-600 font-medium hover:underline">
                  Ver inventario completo →
                </button>
              </div>
            </div>
          )}
        </div>

{/* Usuario */}
<div
  onClick={() => navigate('/perfil')}
  className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition"
>
  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
    {usuario.nombre?.charAt(0).toUpperCase()}
  </div>
  <div className="hidden md:block">
    <p className="text-sm font-semibold text-slate-800 dark:text-white leading-none">{usuario.nombre}</p>
    <p className="text-xs text-slate-400 mt-0.5 capitalize">{usuario.rol}</p>
  </div>
</div>

      </div>
    </div>
  );
}