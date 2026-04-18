import { Bell, Search } from 'lucide-react';

export default function Navbar({ titulo }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  return (
    <div className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40">
      
      {/* Título */}
      <h1 className="text-slate-800 font-semibold text-lg">{titulo}</h1>

      {/* Derecha */}
      <div className="flex items-center gap-4">

        {/* Buscador */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent text-sm text-slate-600 outline-none w-40 placeholder-slate-400"
          />
        </div>

        {/* Notificaciones */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition">
          <Bell size={18} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>

        {/* Usuario */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {usuario.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-none">{usuario.nombre}</p>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{usuario.rol}</p>
          </div>
        </div>

      </div>
    </div>
  );
}