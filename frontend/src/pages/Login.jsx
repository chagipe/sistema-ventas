import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      navigate('/dashboard');
    } catch {
      setError('Correo o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* Panel izquierdo */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <ShoppingBag size={22} color="white" />
          </div>
          <span className="text-white font-bold text-lg tracking-wide">SistemaVentas</span>
        </div>

        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Gestiona tu negocio con total control
          </h1>
          <p className="text-blue-200 text-base leading-relaxed">
            Administra ventas, inventario, caja y más desde un solo lugar. Rápido, seguro y profesional.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Ventas registradas', valor: 'En tiempo real' },
              { label: 'Control de stock', valor: 'Automático' },
              { label: 'Reportes', valor: 'PDF y Excel' },
              { label: 'Escáner', valor: 'Código de barras' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">{item.label}</p>
                <p className="text-white font-semibold mt-1">{item.valor}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-sm">© 2025 SistemaVentas. Todos los derechos reservados.</p>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="bg-blue-600 p-2 rounded-xl">
              <ShoppingBag size={20} color="white" />
            </div>
            <span className="text-white font-bold text-lg">SistemaVentas</span>
          </div>

          <h2 className="text-white text-3xl font-bold mb-2">Bienvenido</h2>
          <p className="text-slate-400 mb-8">Ingresa tus credenciales para continuar</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Correo electrónico
              </label>
              <div className="mt-2 relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-500 placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="mt-2 relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={verPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-11 pr-12 py-3 text-sm outline-none focus:border-blue-500 placeholder-slate-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {verPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition"
            >
              {cargando ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}