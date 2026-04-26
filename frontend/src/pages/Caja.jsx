import { useEffect, useState } from 'react';
import { Plus, X, Wallet, TrendingUp, TrendingDown, DollarSign, FileText, ClipboardList } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formInicial = { tipo: 'ingreso', monto: '', descripcion: '' };

export default function Caja() {
  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState({ ingresos: 0, egresos: 0, ventas: 0, balance: 0 });
  const [grafica, setGrafica] = useState([]);
  const [modal, setModal] = useState(false);
  const [modalCierre, setModalCierre] = useState(false);
  const [cierre, setCierre] = useState(null);
  const [form, setForm] = useState(formInicial);
  const [filtroFecha, setFiltroFecha] = useState('');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => { cargarTodo(); }, []);

  const cargarTodo = async () => {
    await Promise.all([cargarMovimientos(), cargarResumen(), cargarGrafica()]);
  };

  const cargarMovimientos = async (fecha = '') => {
    const url = fecha ? `/caja?fecha=${fecha}` : '/caja';
    const res = await api.get(url);
    setMovimientos(res.data);
  };

  const cargarResumen = async () => {
    const res = await api.get('/caja/resumen');
    setResumen(res.data);
  };

  const cargarGrafica = async () => {
    const res = await api.get('/caja/grafica');
    setGrafica(res.data.map(d => ({
      ...d,
      ingresos: parseFloat(d.ingresos),
      egresos: parseFloat(d.egresos),
    })));
  };

  const guardar = async () => {
    if (!form.monto || !form.descripcion) return;
    await api.post('/caja', { ...form, usuario_id: usuario.id });
    cargarTodo();
    setModal(false);
    setForm(formInicial);
  };

  const abrirCierre = async () => {
    const res = await api.get('/caja/cierre');
    setCierre(res.data);
    setModalCierre(true);
  };

  const imprimirCierre = () => {
    if (!cierre) return;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CIERRE DE CAJA', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Fecha: ${cierre.fecha}`, 14, 30);
    doc.text(`Generado por: ${usuario.nombre}`, 14, 37);

    autoTable(doc, {
      startY: 45,
      head: [['Concepto', 'Cantidad', 'Total']],
      body: [
        ['Ventas del día', cierre.ventas.cantidad, `S/ ${cierre.ventas.total.toFixed(2)}`],
        ['Ingresos manuales', cierre.ingresos.cantidad, `S/ ${cierre.ingresos.total.toFixed(2)}`],
        ['Egresos', cierre.egresos.cantidad, `- S/ ${cierre.egresos.total.toFixed(2)}`],
        ['BALANCE FINAL', '', `S/ ${cierre.balance.toFixed(2)}`],
      ],
      headStyles: { fillColor: [79, 70, 229] },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    if (cierre.porPago.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Método de pago', 'Ventas', 'Total']],
        body: cierre.porPago.map(p => [
          p.tipo_pago === 'yape_plin' ? 'Yape/Plin' : p.tipo_pago,
          p.cantidad,
          `S/ ${parseFloat(p.total).toFixed(2)}`,
        ]),
        headStyles: { fillColor: [5, 150, 105] },
        bodyStyles: { fontSize: 10 },
      });
    }

    doc.save(`cierre_caja_${cierre.fecha.replace(/\//g, '-')}.pdf`);
  };

  const handleFiltroFecha = (e) => {
    setFiltroFecha(e.target.value);
    cargarMovimientos(e.target.value);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="ml-0 lg:ml-60 flex-1 flex flex-col">
        <Navbar titulo="Caja" />
        <main className="mt-16 p-6">

          {/* Tarjetas resumen */}
          <div className="grid grid-cols-4 gap-5 mb-6">
            {[
              { label: 'Ingresos hoy', valor: resumen.ingresos, icon: TrendingUp, light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
              { label: 'Egresos hoy', valor: resumen.egresos, icon: TrendingDown, light: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500' },
              { label: 'Ventas hoy', valor: resumen.ventas, icon: Wallet, light: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600' },
              { label: 'Balance del día', valor: resumen.balance, icon: DollarSign, light: 'bg-violet-50 dark:bg-violet-900/20', text: resumen.balance >= 0 ? 'text-emerald-600' : 'text-red-600' },
            ].map(t => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
                  <div className={`${t.light} p-3 rounded-xl`}><Icon size={22} className={t.text} /></div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{t.label}</p>
                    <p className={`text-2xl font-bold mt-0.5 ${t.text}`}>S/ {parseFloat(t.valor).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfica */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-5">
            <h3 className="text-slate-800 dark:text-white font-semibold mb-4">Ingresos vs Egresos — últimos 7 días</h3>
            {grafica.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No hay movimientos esta semana</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={grafica} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    formatter={(value, name) => [`S/ ${value.toFixed(2)}`, name === 'ingresos' ? 'Ingresos' : 'Egresos']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend formatter={(value) => <span style={{ fontSize: '12px', color: '#94a3b8' }}>{value === 'ingresos' ? 'Ingresos' : 'Egresos'}</span>} />
                  <Bar dataKey="ingresos" fill="#059669" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="egresos" fill="#dc2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Header movimientos */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-slate-800 dark:text-white font-semibold text-lg">Movimientos de caja</h2>
              <p className="text-slate-400 text-sm mt-0.5">{movimientos.length} movimientos</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filtroFecha}
                onChange={handleFiltroFecha}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none"
              />
              {filtroFecha && (
                <button
                  onClick={() => { setFiltroFecha(''); cargarMovimientos(); }}
                  className="px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Limpiar
                </button>
              )}
              <button
                onClick={abrirCierre}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
              >
                <ClipboardList size={16} />
                Cierre de caja
              </button>
              <button
                onClick={() => setModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
              >
                <Plus size={16} />
                Nuevo movimiento
              </button>
            </div>
          </div>

          {/* Tabla movimientos */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Tipo</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Descripción</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Monto</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Usuario</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400">
                    <Wallet size={32} className="mx-auto mb-2 opacity-30" />No hay movimientos
                  </td></tr>
                ) : (
                  movimientos.map((m) => (
                    <tr key={m.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      <td className="px-5 py-4">
                        {m.tipo === 'ingreso'
                          ? <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1 rounded-full">Ingreso</span>
                          : <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">Egreso</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{m.descripcion}</td>
                      <td className="px-5 py-4">
                        <span className={`font-semibold ${m.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {m.tipo === 'ingreso' ? '+' : '-'} S/ {parseFloat(m.monto).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{m.usuario}</td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {new Date(m.creado_en).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal nuevo movimiento */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 dark:text-white text-lg">Nuevo movimiento</h3>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tipo</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button onClick={() => setForm({ ...form, tipo: 'ingreso' })}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${form.tipo === 'ingreso' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-emerald-400'}`}>
                    Ingreso
                  </button>
                  <button onClick={() => setForm({ ...form, tipo: 'egreso' })}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${form.tipo === 'egreso' ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-red-400'}`}>
                    Egreso
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Monto</label>
                <input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Descripción</label>
                <input type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="Descripción del movimiento" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">Cancelar</button>
              <button onClick={guardar} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition">Registrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cierre de caja */}
      {modalCierre && cierre && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-lg">Cierre de caja</h3>
                <p className="text-slate-400 text-xs mt-0.5">{cierre.fecha}</p>
              </div>
              <button onClick={() => setModalCierre(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Ventas del día</p>
                  <p className="text-xs text-slate-400">{cierre.ventas.cantidad} transacciones</p>
                </div>
                <p className="text-sm font-bold text-emerald-600">S/ {cierre.ventas.total.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Ingresos manuales</p>
                  <p className="text-xs text-slate-400">{cierre.ingresos.cantidad} movimientos</p>
                </div>
                <p className="text-sm font-bold text-emerald-600">S/ {cierre.ingresos.total.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Egresos</p>
                  <p className="text-xs text-slate-400">{cierre.egresos.cantidad} movimientos</p>
                </div>
                <p className="text-sm font-bold text-red-600">- S/ {cierre.egresos.total.toFixed(2)}</p>
              </div>

              {cierre.porPago.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Ventas por método de pago</p>
                  {cierre.porPago.map(p => (
                    <div key={p.tipo_pago} className="flex justify-between text-sm py-1">
                      <span className="text-slate-600 dark:text-slate-300 capitalize">{p.tipo_pago === 'yape_plin' ? 'Yape/Plin' : p.tipo_pago}</span>
                      <span className="font-medium text-slate-800 dark:text-white">S/ {parseFloat(p.total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 mt-1">
                <p className="font-bold text-slate-800 dark:text-white">Balance final</p>
                <p className={`text-xl font-bold ${cierre.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  S/ {cierre.balance.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setModalCierre(false)} className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">Cerrar</button>
              <button onClick={imprimirCierre} className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg transition">
                <FileText size={15} />Imprimir PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}