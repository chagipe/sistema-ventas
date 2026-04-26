import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Truck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const formInicial = { nombre: '', telefono: '', email: '', direccion: '', categorias: [] };

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { cargarProveedores(); cargarCategorias(); }, []);

  const cargarProveedores = async () => { const res = await api.get('/proveedores'); setProveedores(res.data); };
  const cargarCategorias = async () => { const res = await api.get('/proveedores/categorias'); setCategorias(res.data); };

  const toggleCategoria = (id) => {
    setForm(prev => ({
      ...prev,
      categorias: prev.categorias.includes(id) ? prev.categorias.filter(c => c !== id) : [...prev.categorias, id]
    }));
  };

  const abrirModal = (proveedor = null) => {
    if (proveedor) {
      setForm({ nombre: proveedor.nombre, telefono: proveedor.telefono || '', email: proveedor.email || '', direccion: proveedor.direccion || '', categorias: proveedor.categorias?.map(c => c.id) || [] });
      setEditando(proveedor.id);
    } else {
      setForm(formInicial);
      setEditando(null);
    }
    setModal(true);
  };

  const cerrarModal = () => { setModal(false); setForm(formInicial); setEditando(null); };

  const guardar = async () => {
    if (!form.nombre) return;
    if (editando) { await api.put(`/proveedores/${editando}`, form); } else { await api.post('/proveedores', form); }
    cargarProveedores();
    cerrarModal();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este proveedor?')) return;
    await api.delete(`/proveedores/${id}`);
    cargarProveedores();
  };

  const proveedoresFiltrados = proveedores.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="ml-0 lg:ml-60 flex-1 flex flex-col">
        <Navbar titulo="Proveedores" />
        <main className="mt-16 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-800 dark:text-white font-semibold text-lg">Lista de proveedores</h2>
              <p className="text-slate-400 text-sm mt-0.5">{proveedores.length} proveedores registrados</p>
            </div>
            <button onClick={() => abrirModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
              <Plus size={16} />Nuevo proveedor
            </button>
          </div>

          <div className="mb-4">
            <input type="text" placeholder="Buscar proveedor..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none w-72 placeholder-slate-400" />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Proveedor</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Teléfono</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Email</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Categorías</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedoresFiltrados.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400"><Truck size={32} className="mx-auto mb-2 opacity-30" />No hay proveedores</td></tr>
                ) : (
                  proveedoresFiltrados.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      <td className="px-5 py-4 font-medium text-slate-800 dark:text-white">{p.nombre}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{p.telefono || '—'}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{p.email || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {p.categorias?.length > 0 ? p.categorias.map(c => (
                            <span key={c.id} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">{c.nombre}</span>
                          )) : <span className="text-slate-400">—</span>}
                        </div>
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 dark:text-white text-lg">{editando ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Nombre', key: 'nombre', type: 'text', placeholder: 'Nombre del proveedor' },
                { label: 'Teléfono', key: 'telefono', type: 'text', placeholder: 'Número de contacto' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'correo@proveedor.com' },
                { label: 'Dirección', key: 'direccion', type: 'text', placeholder: 'Dirección del proveedor' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Categorías que suministra</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categorias.map(c => (
                    <button key={c.id} type="button" onClick={() => toggleCategoria(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${form.categorias.includes(c.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-400'}`}>
                      {c.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={cerrarModal} className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">Cancelar</button>
              <button onClick={guardar} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition">{editando ? 'Guardar cambios' : 'Crear proveedor'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}