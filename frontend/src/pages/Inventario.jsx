import { useEffect, useState } from 'react';
import { ClipboardList, AlertTriangle, Package, TrendingDown, FileSpreadsheet, FileText } from 'lucide-react';
import { exportarInventarioExcel, exportarInventarioPDF } from '../components/Exportar';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = async () => {
    const res = await api.get('/productos');
    setProductos(res.data);
  };

  const stockBajo = productos.filter(p => p.stock <= p.stock_minimo);
  const sinStock = productos.filter(p => p.stock === 0);

  const productosFiltrados = productos
    .filter(p => {
      if (filtro === 'bajo') return p.stock <= p.stock_minimo;
      if (filtro === 'sin_stock') return p.stock === 0;
      if (filtro === 'disponible') return p.stock > p.stock_minimo;
      return true;
    })
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const getEstadoColor = (p) => {
    if (p.stock === 0) return { bg: 'bg-red-50', text: 'text-red-600', label: 'Sin stock' };
    if (p.stock <= p.stock_minimo) return { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Stock bajo' };
    return { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Disponible' };
  };

  const getBarraColor = (p) => {
    const porcentaje = Math.min((p.stock / (p.stock_minimo * 4)) * 100, 100);
    if (p.stock === 0) return { color: 'bg-red-500', porcentaje };
    if (p.stock <= p.stock_minimo) return { color: 'bg-amber-400', porcentaje };
    return { color: 'bg-emerald-500', porcentaje };
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="ml-0 lg:ml-60 flex-1 flex flex-col">
        <Navbar titulo="Inventario" />
        <main className="mt-16 p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-800 dark:text-white font-semibold text-lg">Control de inventario</h2>
              <p className="text-slate-400 text-sm mt-0.5">{productos.length} productos registrados</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => exportarInventarioExcel(productosFiltrados)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
                <FileSpreadsheet size={16} />Excel
              </button>
              <button onClick={() => exportarInventarioPDF(productosFiltrados)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
                <FileText size={16} />PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
              <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-xl">
                <Package size={22} className="text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Total productos</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{productos.length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">
                <AlertTriangle size={22} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Stock bajo</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{stockBajo.length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                <TrendingDown size={22} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Sin stock</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{sinStock.length}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <input type="text" placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none w-64 placeholder-slate-400" />
            <div className="flex gap-2">
              {[{ key: 'todos', label: 'Todos' }, { key: 'disponible', label: 'Disponible' }, { key: 'bajo', label: 'Stock bajo' }, { key: 'sin_stock', label: 'Sin stock' }].map(f => (
                <button key={f.key} onClick={() => setFiltro(f.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filtro === f.key ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Producto</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Categoría</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Proveedor</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Stock actual</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Stock mín.</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Nivel</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400"><ClipboardList size={32} className="mx-auto mb-2 opacity-30" />No hay productos</td></tr>
                ) : (
                  productosFiltrados.map((p) => {
                    const estado = getEstadoColor(p);
                    const barra = getBarraColor(p);
                    return (
                      <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800 dark:text-white">{p.nombre}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{p.descripcion || '—'}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{p.categoria || '—'}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{p.proveedor || '—'}</td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-800 dark:text-white">{p.stock}</span>
                          <span className="text-slate-400 text-xs ml-1">unid.</span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{p.stock_minimo}</td>
                        <td className="px-5 py-4 w-36">
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div className={`${barra.color} h-2 rounded-full transition-all`} style={{ width: `${barra.porcentaje}%` }} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`${estado.bg} ${estado.text} text-xs font-medium px-2.5 py-1 rounded-full`}>{estado.label}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}