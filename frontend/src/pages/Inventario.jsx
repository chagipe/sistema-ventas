import { useEffect, useState } from 'react';
import { ClipboardList, AlertTriangle, Package, TrendingDown, FileSpreadsheet, FileText, ChevronDown, ChevronRight, X } from 'lucide-react';
import { exportarInventarioExcel, exportarInventarioPDF } from '../components/Exportar';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState('lista');
  const [categoriasAbiertas, setCategoriasAbiertas] = useState({});
  const [modalAjuste, setModalAjuste] = useState(false);
  const [productoAjuste, setProductoAjuste] = useState(null);
  const [ajuste, setAjuste] = useState({ tipo: 'entrada', cantidad: '', motivo: '' });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    const [prodRes, catRes] = await Promise.all([
      api.get('/productos'),
      api.get('/categorias'),
    ]);
    setProductos(prodRes.data);
    setCategorias(catRes.data);
    const abiertas = {};
    catRes.data.forEach(c => { abiertas[c.id] = true; });
    setCategoriasAbiertas(abiertas);
  };

  const toggleCategoria = (id) => {
    setCategoriasAbiertas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const guardarAjuste = async () => {
    if (!ajuste.cantidad || parseInt(ajuste.cantidad) <= 0) return;
    await api.patch(`/productos/${productoAjuste.id}/stock`, ajuste);
    cargarDatos();
    setModalAjuste(false);
    setAjuste({ tipo: 'entrada', cantidad: '', motivo: '' });
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

  const productosPorCategoria = categorias.map(cat => ({
    ...cat,
    productos: productosFiltrados.filter(p => p.categoria_id === cat.id),
  })).filter(cat => cat.productos.length > 0);

  const sinCategoria = productosFiltrados.filter(p => !p.categoria_id);

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

  const FilaProducto = ({ p }) => {
    const estado = getEstadoColor(p);
    const barra = getBarraColor(p);
    return (
      <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
        <td className="px-5 py-4">
          <p className="font-medium text-slate-800 dark:text-white">{p.nombre}</p>
          <p className="text-slate-400 text-xs mt-0.5">{p.descripcion || '—'}</p>
        </td>
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
          <span className={`${estado.bg} ${estado.text} text-xs font-medium px-2.5 py-1 rounded-full`}>
            {estado.label}
          </span>
        </td>
        <td className="px-5 py-4">
          <button
            onClick={() => { setProductoAjuste(p); setModalAjuste(true); }}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Ajustar stock
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="ml-0 lg:ml-60 flex-1 flex flex-col">
        <Navbar titulo="Inventario" />
        <main className="mt-16 p-6">

          {/* Header */}
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

          {/* Tarjetas resumen */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
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

          {/* Filtros */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <input type="text" placeholder="Buscar producto..." value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none w-64 placeholder-slate-400" />
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'disponible', label: 'Disponible' },
                { key: 'bajo', label: 'Stock bajo' },
                { key: 'sin_stock', label: 'Sin stock' },
              ].map(f => (
                <button key={f.key} onClick={() => setFiltro(f.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filtro === f.key ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={() => setVista('lista')}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${vista === 'lista' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                Lista
              </button>
              <button onClick={() => setVista('categorias')}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${vista === 'categorias' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                Por categoría
              </button>
            </div>
          </div>

          {/* Vista lista */}
          {vista === 'lista' && (
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
                    <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Ajuste</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-slate-400">
                      <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />No hay productos
                    </td></tr>
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
                          <td className="px-5 py-4">
                            {p.categoria ? (
                              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">{p.categoria}</span>
                            ) : '—'}
                          </td>
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
                          <td className="px-5 py-4">
                            <button
                              onClick={() => { setProductoAjuste(p); setModalAjuste(true); }}
                              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition"
                            >
                              Ajustar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Vista por categoría */}
          {vista === 'categorias' && (
            <div className="flex flex-col gap-4">
              {productosPorCategoria.map(cat => (
                <div key={cat.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <button onClick={() => toggleCategoria(cat.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <div className="flex items-center gap-3">
                      {categoriasAbiertas[cat.id] ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                      <span className="font-semibold text-slate-800 dark:text-white">{cat.nombre}</span>
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        {cat.productos.length} producto{cat.productos.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-amber-500 text-sm font-medium">
                      {cat.productos.filter(p => p.stock <= p.stock_minimo).length} con stock bajo
                    </span>
                  </button>
                  {categoriasAbiertas[cat.id] && (
                    <div className="border-t border-slate-200 dark:border-slate-700">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900">
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Producto</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Proveedor</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Stock actual</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Stock mín.</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Nivel</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Estado</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Ajuste</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.productos.map(p => <FilaProducto key={p.id} p={p} />)}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}

              {sinCategoria.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <button onClick={() => toggleCategoria('sin_categoria')}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    {categoriasAbiertas['sin_categoria'] ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    <span className="font-semibold text-slate-800 dark:text-white">Sin categoría</span>
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                      {sinCategoria.length} producto{sinCategoria.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  {categoriasAbiertas['sin_categoria'] && (
                    <div className="border-t border-slate-200 dark:border-slate-700">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900">
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Producto</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Proveedor</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Stock actual</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Stock mín.</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Nivel</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Estado</th>
                            <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Ajuste</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sinCategoria.map(p => <FilaProducto key={p.id} p={p} />)}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {productosPorCategoria.length === 0 && sinCategoria.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-400">
                  <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />No hay productos
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal ajuste de stock */}
      {modalAjuste && productoAjuste && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-lg">Ajuste de stock</h3>
                <p className="text-slate-400 text-sm mt-0.5">{productoAjuste.nombre}</p>
              </div>
              <button onClick={() => setModalAjuste(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Stock actual */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-5 flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Stock actual</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {productoAjuste.stock} <span className="text-sm font-normal text-slate-400">unid.</span>
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tipo de ajuste</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAjuste({ ...ajuste, tipo: 'entrada' })}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${ajuste.tipo === 'entrada' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-emerald-400'}`}
                  >
                    + Entrada
                  </button>
                  <button
                    onClick={() => setAjuste({ ...ajuste, tipo: 'salida' })}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${ajuste.tipo === 'salida' ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-red-400'}`}
                  >
                    - Salida
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cantidad</label>
                <input
                  type="number" min="1" value={ajuste.cantidad}
                  onChange={(e) => setAjuste({ ...ajuste, cantidad: e.target.value })}
                  className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Motivo</label>
                <input
                  type="text" value={ajuste.motivo}
                  onChange={(e) => setAjuste({ ...ajuste, motivo: e.target.value })}
                  className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Ej: Merma, error de conteo, nueva entrega..."
                />
              </div>

              {ajuste.cantidad && (
                <div className={`rounded-lg p-3 flex items-center justify-between ${ajuste.tipo === 'entrada' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Stock resultante</p>
                  <p className={`text-lg font-bold ${ajuste.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {ajuste.tipo === 'entrada'
                      ? productoAjuste.stock + parseInt(ajuste.cantidad || 0)
                      : Math.max(0, productoAjuste.stock - parseInt(ajuste.cantidad || 0))
                    } unid.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAjuste(false)}
                className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardarAjuste}
                disabled={!ajuste.cantidad}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition"
              >
                Aplicar ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}