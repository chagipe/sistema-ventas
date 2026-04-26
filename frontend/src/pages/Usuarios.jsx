import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const formInicial = { nombre: '', email: '', password: '', rol: 'vendedor', activo: true };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { cargarUsuarios(); }, []);
  const cargarUsuarios = async () => { const res = await api.get('/usuarios'); setUsuarios(res.data); };

  const abrirModal = (usuario = null) => {
    if (usuario) { setForm({ nombre: usuario.nombre, email: usuario.email, password: '', rol: usuario.rol, activo: usuario.activo }); setEditando(usuario.id); }
    else { setForm(formInicial); setEditando(null); }
    setError(''); setModal(true);
  };

  const cerrarModal = () => { setModal(false); setForm(formInicial); setEditando(null); setError(''); };

  const guardar = async () => {
    if (!form.nombre || !form.email) return;
    if (!editando && !form.password) { setError('La contraseña es requerida'); return; }
    try {
      if (editando) { await api.put(`/usuarios/${editando}`, form); } else { await api.post('/usuarios', form); }
      cargarUsuarios(); cerrarModal();
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
  };

  const desactivar = async (id) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    await api.delete(`/usuarios/${id}`); cargarUsuarios();
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="ml-0 lg:ml-60 flex-1 flex flex-col">
        <Navbar titulo="Usuarios" />
        <main className="mt-16 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-800 dark:text-white font-semibold text-lg">Gestión de usuarios</h2>
              <p className="text-slate-400 text-sm mt-0.5">{usuarios.length} usuarios registrados</p>
            </div>
            <button onClick={() => abrirModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
              <Plus size={16} />Nuevo usuario
            </button>
          </div>

          <div className="mb-4">
            <input type="text" placeholder="Buscar usuario..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none w-72 placeholder-slate-400" />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Usuario</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Email</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Rol</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Estado</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Registrado</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400"><Users size={32} className="mx-auto mb-2 opacity-30" />No hay usuarios</td></tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium text-slate-800 dark:text-white">{u.nombre}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${u.rol === 'admin' ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {u.activo
                          ? <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1 rounded-full">Activo</span>
                          : <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">Inactivo</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{new Date(u.creado_en).toLocaleDateString('es-PE')}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => abrirModal(u)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 hover:text-blue-600 transition"><Pencil size={15} /></button>
                          <button onClick={() => desactivar(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 transition"><Trash2 size={15} /></button>
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
              <h3 className="font-semibold text-slate-800 dark:text-white text-lg">{editando ? 'Editar usuario' : 'Nuevo usuario'}</h3>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nombre</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="Nombre completo" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="correo@ejemplo.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rol</label>
                  <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
                    className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option value="vendedor">Vendedor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</label>
                  <select value={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.value === 'true' })}
                    className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={cerrarModal} className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">Cancelar</button>
              <button onClick={guardar} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition">{editando ? 'Guardar cambios' : 'Crear usuario'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}