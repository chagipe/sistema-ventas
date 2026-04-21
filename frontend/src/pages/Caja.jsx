import { useEffect, useState } from 'react';
import { Plus, X, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const formInicial = { tipo: 'ingreso', monto: '', descripcion: '' };

export default function Caja() {
  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState({ ingresos: 0, egresos: 0, ventas: 0, balance: 0 });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(formInicial);
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    cargarMovimientos();
    cargarResumen();
  }, []);

  const cargarMovimientos = async () => {
    const res = await api.get('/caja');
    setMovimientos(res.data);
  };

  const cargarResumen = async () => {
    const res = await api.get('/caja/resumen');
    setResumen(res.data);
  };

  const guardar = async () => {
    if (!form.monto || !form.descripcion) return;
    await api.post('/caja', { ...form, usuario_id: usuario.id });
    cargarMovimientos();
    cargarResumen();
    setModal(false);
    setForm(formInicial);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-60 flex-1 flex flex-col">
        <Navbar titulo="Caja" />
        <main className="mt-16 p-6">

          {/* Tarjetas resumen */}
          <div className="grid grid-cols-4 gap-5 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-xl">
                <TrendingUp size={22} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Ingresos hoy</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">S/ {resumen.ingresos.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="bg-red-50 p-3 rounded-xl">
                <TrendingDown size={22} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Egresos hoy</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">S/ {resumen.egresos.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <Wallet size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Ventas hoy</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">S/ {resumen.ventas.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="bg-violet-50 p-3 rounded-xl">
                <DollarSign size={22} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Balance del día</p>
                <p className={`text-2xl font-bold mt-0.5 ${resumen.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  S/ {resumen.balance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-slate-800 font-semibold text-lg">Movimientos de caja</h2>
              <p className="text-slate-400 text-sm mt-0.5">{movimientos.length} movimientos registrados</p>
            </div>
            <button
              onClick={() => setModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              <Plus size={16} />
              Nuevo movimiento
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Tipo</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Descripción</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Monto</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Usuario</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      <Wallet size={32} className="mx-auto mb-2 opacity-30" />
                      No hay movimientos registrados
                    </td>
                  </tr>
                ) : (
                  movimientos.map((m) => (
                    <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        {m.tipo === 'ingreso' ? (
                          <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1 rounded-full">
                            Ingreso
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">
                            Egreso
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-700">{m.descripcion}</td>
                      <td className="px-5 py-4">
                        <span className={`font-semibold ${m.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {m.tipo === 'ingreso' ? '+' : '-'} S/ {parseFloat(m.monto).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{m.usuario}</td>
                      <td className="px-5 py-4 text-slate-500">
                        {new Date(m.creado_en).toLocaleDateString('es-PE', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 text-lg">Nuevo movimiento</h3>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tipo</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setForm({ ...form, tipo: 'ingreso' })}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                      form.tipo === 'ingreso'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    Ingreso
                  </button>
                  <button
                    onClick={() => setForm({ ...form, tipo: 'egreso' })}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                      form.tipo === 'egreso'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-red-400'
                    }`}
                  >
                    Egreso
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Monto</label>
                <input
                  type="number"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Descripción del movimiento"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(false)}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}