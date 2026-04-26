import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Package, Scan } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const formInicial = {
  nombre: '', descripcion: '', precio: '',
  stock: '', stock_minimo: '5', categoria_id: '',
  proveedor_id: '', codigo_barras: '',
};

export default function Productos() {
  const [relaciones, setRelaciones] = useState([]);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [error, setError] = useState('');
  const [escaneando, setEscaneando] = useState(false);
  const codigoRef = useRef(null);

  useEffect(() => { cargarProductos(); cargarExtras(); }, []);

  useEffect(() => {
    if (modal && escaneando) setTimeout(() => codigoRef.current?.focus(), 100);
  }, [modal, escaneando]);

  const cargarProductos = async () => {
    const res = await api.get('/productos');
    setProductos(res.data);
  };

  const cargarExtras = async () => {
    const res = await api.get('/productos/extras');
    setCategorias(res.data.categorias);
    setProveedores(res.data.proveedores);
    setRelaciones(res.data.relaciones);
  };

  const handleCategoriaChange = (categoriaId) => {
    setForm({ ...form, categoria_id: categoriaId, proveedor_id: '' });
    if (!categoriaId) { setProveedoresFiltrados([]); return; }
    const provIds = relaciones.filter(r => r.categoria_id === parseInt(categoriaId)).map(r => r.proveedor_id);
    setProveedoresFiltrados(proveedores.filter(p => provIds.includes(p.id)));
  };

  const handleCodigoBarras = async (e) => {
    if (e.key === 'Enter' && form.codigo_barras) {
      try {
        const res = await api.get(`/productos/barras/${form.codigo_barras}`);
        const p = res.data;
        setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, stock_minimo: p.stock_minimo, categoria_id: p.categoria_id || '', proveedor_id: p.proveedor_id || '', codigo_barras: p.codigo_barras });
        setEditando(p.id);
        setError('⚠️ Producto ya registrado — puedes editar sus datos');
      } catch { setError(''); }
      setEscaneando(false);
    }
  };

  const abrirModal = (producto = null) => {
    setError('');
    if (producto) {
      setForm({ nombre: producto.nombre, descripcion: producto.descripcion || '', precio: producto.precio, stock: producto.stock, stock_minimo: producto.stock_minimo, categoria_id: producto.categoria_id || '', proveedor_id: producto.proveedor_id || '', codigo_barras: producto.codigo_barras || '' });
      if (producto.categoria_id) {
        const provIds = relaciones.filter(r => r.categoria_id === producto.categoria_id).map(r => r.proveedor_id);
        setProveedoresFiltrados(proveedores.filter(p => provIds.includes(p.id)));
      }
      setEditando(producto.id);
    } else {
      setForm(formInicial);
      setProveedoresFiltrados([]);
      setEditando(null);
    }
    setModal(true);
  };

  const cerrarModal = () => {
    setModal(false); setForm(formInicial); setProveedoresFiltrados([]);
    setEditando(null); setError(''); setEscaneando(false);
  };

  const guardar = async () => {
    if (!form.nombre || !form.precio || !form.stock) return;
    try {
      if (editando) { await api.put(`/productos/${editando}`, form); }
      else { await api.post('/productos', form); }
      cargarProductos(); cerrarModal();
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await api.delete(`/productos/${id}`); cargarProductos();
  };

  const productosFiltrados = productos
    .filter(p => filtroCategoria ? p.categoria_id === parseInt(filtroCategoria) : true)
    .filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.codigo_barras || '').includes(busqueda)
    );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="ml-0 lg:ml-60 flex-1 flex flex-col">
        <Navbar titulo="Productos" />
        <main className="mt-16 p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-800 dark:text-white font-semibold text-lg">Lista de productos</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {productosFiltrados.length} de {productos.length} productos
              </p>
            </div>
            <button onClick={() => abrirModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
              <Plus size={16} />Nuevo producto
            </button>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <input type="text" placeholder="Buscar por nombre o código..." value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none w-72 placeholder-slate-400" />

            {/* Filtro por categoría */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFiltroCategoria('')}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  filtroCategoria === ''
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Todos
              </button>
              {categorias.map(c => (
                <button
                  key={c.id}
                  onClick={() => setFiltroCategoria(filtroCategoria === c.id.toString() ? '' : c.id.toString())}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                    filtroCategoria === c.id.toString()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {c.nombre}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    filtroCategoria === c.id.toString()
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {productos.filter(p => p.categoria_id === c.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Producto</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Código</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Categoría</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Proveedor</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Precio</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Stock</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Estado</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    {filtroCategoria ? 'No hay productos en esta categoría' : 'No hay productos registrados'}
                  </td></tr>
                ) : (
                  productosFiltrados.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800 dark:text-white">{p.nombre}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{p.descripcion || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{p.codigo_barras || '—'}</td>
                      <td className="px-5 py-4">
                        {p.categoria ? (
                          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                            {p.categoria}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{p.proveedor || '—'}</td>
                      <td className="px-5 py-4 text-slate-800 dark:text-white font-medium">S/ {parseFloat(p.precio).toFixed(2)}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{p.stock}</td>
                      <td className="px-5 py-4">
                        {p.stock <= p.stock_minimo
                          ? <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">Stock bajo</span>
                          : <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1 rounded-full">Disponible</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => abrirModal(p)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 hover:text-blue-600 transition"><Pencil size={15} /></button>
                          <button onClick={() => eliminar(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 transition"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 dark:text-white text-lg">{editando ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {error && <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Código de barras</label>
                <div className="mt-1 flex gap-2">
                  <input ref={codigoRef} type="text" value={form.codigo_barras}
                    onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
                    onKeyDown={handleCodigoBarras}
                    className={`flex-1 border rounded-lg px-3 py-2.5 text-sm outline-none font-mono dark:bg-slate-700 dark:text-white ${escaneando ? 'border-blue-500 bg-blue-50 animate-pulse' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'}`}
                    placeholder={escaneando ? 'Escanea el producto...' : 'Código de barras'} />
                  <button onClick={() => { setEscaneando(!escaneando); setTimeout(() => codigoRef.current?.focus(), 100); }}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition ${escaneando ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-400'}`}>
                    <Scan size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nombre</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Nombre del producto" />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Descripción</label>
                <input type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Descripción opcional" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[{ label: 'Precio', key: 'precio', placeholder: '0.00' }, { label: 'Stock', key: 'stock', placeholder: '0' }, { label: 'Stock mín.', key: 'stock_minimo', placeholder: '5' }].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{f.label}</label>
                    <input type="number" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      placeholder={f.placeholder} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Categoría</label>
                  <select value={form.categoria_id} onChange={(e) => handleCategoriaChange(e.target.value)}
                    className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option value="">Seleccionar</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Proveedor</label>
                  <select value={form.proveedor_id} onChange={(e) => setForm({ ...form, proveedor_id: e.target.value })}
                    disabled={!form.categoria_id}
                    className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">Seleccionar</option>
                    {proveedoresFiltrados.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={cerrarModal} className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">Cancelar</button>
              <button onClick={guardar} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition">{editando ? 'Guardar cambios' : 'Crear producto'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}