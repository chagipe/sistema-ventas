import { useEffect, useState } from 'react';
import { TrendingUp, Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const tarjetas = [
  {
    key: 'ventasHoy',
    label: 'Ventas de hoy',
    prefix: 'S/',
    icon: TrendingUp,
    color: 'bg-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    key: 'totalProductos',
    label: 'Total productos',
    icon: Package,
    color: 'bg-emerald-600',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    key: 'stockBajo',
    label: 'Stock bajo',
    icon: AlertTriangle,
    color: 'bg-red-500',
    light: 'bg-red-50',
    text: 'text-red-500',
  },
  {
    key: 'totalVentas',
    label: 'Ventas totales',
    icon: ShoppingCart,
    color: 'bg-violet-600',
    light: 'bg-violet-50',
    text: 'text-violet-600',
  },
];

export default function Dashboard() {
  const [metricas, setMetricas] = useState({
    totalVentas: 0,
    totalProductos: 0,
    stockBajo: 0,
    ventasHoy: 0,
  });

  useEffect(() => {
    api.get('/dashboard/metricas')
      .then(res => setMetricas(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-60 flex-1 flex flex-col">
        <Navbar titulo="Dashboard" />
        <main className="mt-16 p-6">

          {/* Tarjetas */}
          <div className="grid grid-cols-4 gap-5 mb-6">
            {tarjetas.map((t) => {
              const Icon = t.icon;
              const valor = metricas[t.key];
              return (
                <div key={t.key} className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4">
                  <div className={`${t.light} p-3 rounded-xl`}>
                    <Icon size={22} className={t.text} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-0.5">
                      {t.prefix ? `${t.prefix} ${valor}` : valor}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bienvenida */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <h2 className="text-slate-800 font-semibold text-lg mb-1">Bienvenido al Sistema de Ventas</h2>
            <p className="text-slate-400 text-sm">Selecciona un módulo del menú lateral para comenzar.</p>
          </div>

        </main>
      </div>
    </div>
  );
}