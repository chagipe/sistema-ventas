import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen bg-slate-950 flex overflow-hidden">

      {/* Panel izquierdo */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Círculos decorativos */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-32 -left-20 w-96 h-96 bg-white/10 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 -right-10 w-48 h-48 bg-white/10 rounded-full"
        />

        {/* Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-3 relative z-10"
        >
          <div className="bg-white/20 p-2 rounded-xl">
            <ShoppingBag size={22} color="white" />
          </div>
          <span className="text-white font-bold text-lg tracking-wide">SistemaVentas</span>
        </motion.div>

        {/* Texto central */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-10"
        >
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
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"
              >
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">{item.label}</p>
                <p className="text-white font-semibold mt-1">{item.valor}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-blue-300 text-sm relative z-10"
        >
          © 2025 SistemaVentas. Todos los derechos reservados.
        </motion.p>
      </motion.div>

      {/* Panel derecho */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mb-10 lg:hidden"
          >
            <div className="bg-blue-600 p-2 rounded-xl">
              <ShoppingBag size={20} color="white" />
            </div>
            <span className="text-white font-bold text-lg">SistemaVentas</span>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-white text-3xl font-bold mb-2">Bienvenido</h2>
            <p className="text-slate-400 mb-8">Ingresa tus credenciales para continuar</p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            onSubmit={handleLogin}
            className="flex flex-col gap-5"
          >
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
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-500 placeholder-slate-600 transition-all duration-200"
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
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-11 pr-12 py-3 text-sm outline-none focus:border-blue-500 placeholder-slate-600 transition-all duration-200"
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

            <motion.button
              type="submit"
              disabled={cargando}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors duration-200 relative overflow-hidden"
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Ingresando...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}