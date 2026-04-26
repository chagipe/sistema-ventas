import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const COLORES = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed'];

export default function Reportes() {
  const [ventasDia, setVentasDia] = useState([]);
  const [ventasMes, setVentasMes] = useState([]);
  const [productosTop, setProductosTop] = useState([]);
  const [ventasPago, setVentasPago] = useState([]);
  const [periodo, setPeriodo] = useState('dia');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [dia, mes, top, pago] = await Promise.all([
        api.get('/reportes/ventas-por-dia'),
        api.get('/reportes/ventas-por-mes'),
        api.get('/reportes/productos-top'),
        api.get('/reportes/ventas-por-pago'),
      ]);
      setVentasDia(dia.data.map(d => ({ ...d, total: parseFloat(d.total) })));
      setVentasMes(mes.data.map(d => ({ ...d, total: parseFloat(d.total) })));
      setProductosTop(top.data.map(d => ({ ...d, total: parseFloat(d.total), cantidad: parseInt(d.cantidad) })));
      setVentasPago(pago.data.map(d => ({
        name: d.tipo_pago === 'yape_plin' ? 'Yape/Plin' : d.tipo_pago.charAt(0).toUpperCase() + d.tipo_pago.slice(1),
        value: parseInt(d.cantidad),
        total: parseFloat(d.total),
      })));
    } catch {}
  };

  const datosGrafica = periodo === 'dia' ? ventasDia : ventasMes;
  const labelEje = periodo === 'dia' ? 'dia' : 'mes';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="ml-0 lg:ml-60 flex-1 flex flex-col">
        <Navbar titulo="Reportes" />
        <main className="mt-16 p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-800 dark:text-white font-semibold text-lg">Análisis de ventas</h2>
              <p className="text-slate-400 text-sm mt-0.5">Resumen del rendimiento del negocio</p>
            </div>
            <div className="flex gap-2">
              {[{ key: 'dia', label: 'Últimos 7 días' }, { key: 'mes', label: 'Últimos 6 meses' }].map(p => (
                <button key={p.key} onClick={() => setPeriodo(p.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${periodo === p.key ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-5">
            <h3 className="text-slate-700 dark:text-white font-semibold mb-4">Ingresos por {periodo === 'dia' ? 'día' : 'mes'}</h3>
            {datosGrafica.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <BarChart2 size={40} className="mb-3 opacity-30" /><p className="text-sm">No hay datos para mostrar</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={datosGrafica} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey={labelEje} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip formatter={(value) => [`S/ ${value.toFixed(2)}`, 'Total']} contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }} />
                  <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-5">
            <h3 className="text-slate-700 dark:text-white font-semibold mb-4">Cantidad de ventas por {periodo === 'dia' ? 'día' : 'mes'}</h3>
            {datosGrafica.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <BarChart2 size={40} className="mb-3 opacity-30" /><p className="text-sm">No hay datos para mostrar</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={datosGrafica} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey={labelEje} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip formatter={(value) => [value, 'Ventas']} contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }} />
                  <Line type="monotone" dataKey="cantidad" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-slate-700 dark:text-white font-semibold mb-4">Top 5 productos más vendidos</h3>
              {productosTop.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <BarChart2 size={32} className="mb-2 opacity-30" /><p className="text-sm">Sin datos</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={productosTop} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis dataKey="nombre" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
                    <Tooltip formatter={(value) => [value, 'Unidades']} contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }} />
                    <Bar dataKey="cantidad" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-slate-700 dark:text-white font-semibold mb-4">Ventas por método de pago</h3>
              {ventasPago.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <BarChart2 size={32} className="mb-2 opacity-30" /><p className="text-sm">Sin datos</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={ventasPago} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {ventasPago.map((_, index) => <Cell key={index} fill={COLORES[index % COLORES.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} ventas — S/ ${props.payload.total.toFixed(2)}`, props.payload.name]} contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }} />
                    <Legend formatter={(value) => <span style={{ fontSize: '13px', color: '#94a3b8' }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}