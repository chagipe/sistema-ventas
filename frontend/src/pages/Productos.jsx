import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Package } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const formInicial = {
  nombre: '', descripcion: '', precio: '',
  stock: '', stock_minimo: '5', categoria_id: '', proveedor_id: '',
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

  useEffect(() => {
    cargarProductos();
    cargarExtras();
  }, []);

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
    if (!categoriaId) {
      setProveedoresFiltrados([]);
      return;
    }
    const provIds = relaciones
      .filter(r => r.categoria_id === parseInt(categoriaId))
      .map(r => r.proveedor_id);
    setProveedoresFiltrados(proveedores.filter(p => provIds.includes(p.id)));
  };

  const abrirModal = (producto = null) => {
    if (producto) {
      setForm({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        stock: producto.stock,
        stock_minimo: producto.stock_minimo,
        categoria_id: producto.categoria_id || '',
        proveedor_id: producto.proveedor_id || '',
      });
      // Filtrar proveedores al editar
      if (producto.categoria_id) {
        const provIds = relaciones
          .filter(r => r.categoria_id === producto.categoria_id)
          .map(r => r.proveedor_id);
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
    setModal(false);
    setForm(formInicial);
    setProveedoresFiltrados([]);
    setEditando(null);
  };

  const guardar = async () => {
    if (!form.nombre || !form.precio || !form.stock) return;
    if (editando) {
      await api.put(`/productos/${editando}`, form);
    } else {
      await api.post('/productos', form);
    }
    cargarProductos();
    cerrarModal();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await api.delete(`/productos/${id}`);
    cargarProductos();
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-60 flex-1 flex flex-col">
        <Navbar titulo="Productos" />
        <main className="mt-16 p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-800 font-semibold text-lg">Lista de productos</h2>
              <p className="text-slate-400 text-sm mt-0.5">{productos.length} productos registrados</p>
            </div>
            <button
              onClick={() => abrirModal()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              <Plus size={16} />
              Nuevo producto
            </button>
          </div>

          {/* Buscador */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 outline-none w-72 placeholder-slate-400"
            />
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Producto</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Categoría</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Proveedor</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Precio</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Stock</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Estado</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      No hay productos registrados
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{p.nombre}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{p.descripcion || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{p.categoria || '—'}</td>
                      <td className="px-5 py-4 text-slate-600">{p.proveedor || '—'}</td>
                      <td className="px-5 py-4 text-slate-800 font-medium">S/ {parseFloat(p.precio).toFixed(2)}</td>
                      <td className="px-5 py-4 text-slate-600">{p.stock}</td>
                      <td className="px-5 py-4">
                        {p.stock <= p.stock_minimo ? (
                          <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">Stock bajo</span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1 rounded-full">Disponible</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirModal(p)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => eliminar(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition"
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 text-lg">
                {editando ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Descripción opcional"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Precio</label>
                  <input
                    type="number"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Stock mín.</label>
                  <input
                    type="number"
                    value={form.stock_minimo}
                    onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Categoría</label>
                  <select
                    value={form.categoria_id}
                    onChange={(e) => handleCategoriaChange(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">Seleccionar</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Proveedor</label>
                  <select
                    value={form.proveedor_id}
                    onChange={(e) => setForm({ ...form, proveedor_id: e.target.value })}
                    disabled={!form.categoria_id}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar</option>
                    {proveedoresFiltrados.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={cerrarModal}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition"
              >
                {editando ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}