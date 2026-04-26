import { useEffect, useState } from 'react';
import { TrendingUp, Package, AlertTriangle, ShoppingCart, Trophy, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const tarjetas = [
  { key: 'ventasHoy', label: 'Ventas de hoy', prefix: 'S/', icon: TrendingUp, light: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600' },
  { key: 'totalProductos', label: 'Total productos', icon: Package, light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
  { key: 'stockBajo', label: 'Stock bajo', icon: AlertTriangle, light: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500' },
  { key: 'totalVentas', label: 'Ventas totales', icon: ShoppingCart, light: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600' },
];

export default function Dashboard() {
  const [metricas, setMetricas] = useState({ totalVentas: 0, totalProductos: 0, stockBajo: 0, ventasHoy: 0 });
  const [ventasSemana, setVentasSemana] = useState([]);
  const [productosTop, setProductosTop] = useState([]);
  const [ultimasVentas, setUltimasVentas] = useState([]);
  const [stockBajoLista, setStockBajoLista] = useState([]);
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    cargarDatos();
    const reloj = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(reloj);
  }, []);

  const cargarDatos = async () => {
    try {
      const [m, s, t, u, sb] = await Promise.all([
        api.get('/dashboard/metricas'),
        api.get('/dashboard/ventas-semana'),
        api.get('/dashboard/productos-top'),
        api.get('/dashboard/ultimas-ventas'),
        api.get('/dashboard/stock-bajo'),
      ]);
      setMetricas(m.data);
      setVentasSemana(s.data.map(d => ({ ...d, total: parseFloat(d.total) })));
      setProductosTop(t.data);
      setUltimasVentas(u.data);
      setStockBajoLista(sb.data);
    } catch {}
  };

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="ml-0 lg:ml-60 flex-1 flex flex-col">
        <Navbar titulo="Dashboard" />
        <main className="mt-16 p-6">

          {/* Saludo y fecha */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-800 dark:text-white font-bold text-2xl">
                Hola, {usuario.nombre?.split(' ')[0]} 👋
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {hora.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-slate-800 dark:text-white font-mono">
                {hora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Hora actual</p>
            </div>
          </div>

          {/* Tarjetas métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {tarjetas.map((t) => {
              const Icon = t.icon;
              const valor = metricas[t.key];
              return (
                <div key={t.key} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <div className={`${t.light} p-3 rounded-xl`}>
                    <Icon size={22} className={t.text} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{t.label}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
                      {t.prefix ? `${t.prefix} ${valor}` : valor}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfica de ventas + Top productos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

            {/* Gráfica */}
            <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-slate-800 dark:text-white font-semibold mb-4">Ventas últimos 7 días</h3>
              {ventasSemana.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No hay ventas esta semana</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ventasSemana} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip
                      formatter={(value) => [`S/ ${value.toFixed(2)}`, 'Total']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top productos hoy */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-amber-500" />
                <h3 className="text-slate-800 dark:text-white font-semibold">Top productos hoy</h3>
              </div>
              {productosTop.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm text-center">
                  No hay ventas registradas hoy
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {productosTop.map((p, i) => (
                    <div key={p.nombre} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : 'bg-orange-400'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{p.nombre}</p>
                        <p className="text-xs text-slate-400">{p.cantidad} unidades</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">S/ {parseFloat(p.total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Últimas ventas + Stock bajo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Últimas ventas */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-blue-500" />
                <h3 className="text-slate-800 dark:text-white font-semibold">Últimas ventas</h3>
              </div>
              {ultimasVentas.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm">No hay ventas registradas</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {ultimasVentas.map((v) => (
                    <div key={v.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{v.cliente || 'Cliente general'}</p>
                        <p className="text-xs text-slate-400">{v.vendedor} · {new Date(v.creado_en).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">S/ {parseFloat(v.total).toFixed(2)}</p>
                        <span className="text-xs text-slate-400 capitalize">{v.tipo_pago}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stock bajo */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-red-500" />
                <h3 className="text-slate-800 dark:text-white font-semibold">Productos con stock bajo</h3>
              </div>
              {stockBajoLista.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm text-center">
                  Todos los productos tienen stock suficiente ✅
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {stockBajoLista.map((p) => (
                    <div key={p.nombre} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{p.nombre}</p>
                        <p className="text-xs text-slate-400">Mínimo: {p.stock_minimo} unid.</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {p.stock === 0 ? 'Sin stock' : `${p.stock} unid.`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}