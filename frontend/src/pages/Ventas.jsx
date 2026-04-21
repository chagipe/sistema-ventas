import { useEffect, useState, useRef } from 'react';
import { Plus, X, Trash2, ShoppingCart, Scan, Printer, FileSpreadsheet, FileText } from 'lucide-react';
import { exportarVentasExcel, exportarVentasPDF } from '../components/Exportar';
import { imprimirTicket } from '../components/Ticket';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modal, setModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [items, setItems] = useState([]);
  const [escaneando, setEscaneando] = useState(false);
  const [codigoEscaner, setCodigoEscaner] = useState('');
  const [errorEscaner, setErrorEscaner] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const escanerRef = useRef(null);
  const [form, setForm] = useState({
    cliente_id: '',
    tipo_pago: 'efectivo',
    producto_id: '',
    cantidad: 1,
  });

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    cargarVentas();
    cargarProductos();
    cargarClientes();
  }, []);

  useEffect(() => {
    if (modal && escaneando) {
      setTimeout(() => escanerRef.current?.focus(), 100);
    }
  }, [modal, escaneando]);

  const cargarVentas = async () => {
    const res = await api.get('/ventas');
    setVentas(res.data);
  };

  const cargarProductos = async () => {
    const res = await api.get('/productos');
    setProductos(res.data);
  };

  const cargarClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch {
      setClientes([]);
    }
  };

  const agregarItem = (producto, cantidad = 1) => {
    if (!producto) return;
    const existente = items.find(i => i.producto_id === producto.id);
    if (existente) {
      setItems(items.map(i =>
        i.producto_id === producto.id
          ? { ...i, cantidad: i.cantidad + cantidad, subtotal: (i.cantidad + cantidad) * i.precio_unitario }
          : i
      ));
    } else {
      setItems(prev => [...prev, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: parseFloat(producto.precio),
        cantidad,
        subtotal: parseFloat(producto.precio) * cantidad,
      }]);
    }
  };

  const agregarItemManual = () => {
    const producto = productos.find(p => p.id === parseInt(form.producto_id));
    if (!producto || !form.cantidad) return;
    agregarItem(producto, parseInt(form.cantidad));
    setForm({ ...form, producto_id: '', cantidad: 1 });
  };

  const handleEscaner = async (e) => {
    if (e.key === 'Enter' && codigoEscaner) {
      setErrorEscaner('');
      try {
        const res = await api.get(`/productos/barras/${codigoEscaner}`);
        agregarItem(res.data, 1);
        setCodigoEscaner('');
        setTimeout(() => escanerRef.current?.focus(), 100);
      } catch {
        setErrorEscaner(`Producto no encontrado: ${codigoEscaner}`);
        setCodigoEscaner('');
      }
    }
  };

  const quitarItem = (producto_id) => {
    setItems(items.filter(i => i.producto_id !== producto_id));
  };

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  const cerrarModal = () => {
    setModal(false);
    setItems([]);
    setEscaneando(false);
    setMontoRecibido('');
    setCodigoEscaner('');
    setForm({ cliente_id: '', tipo_pago: 'efectivo', producto_id: '', cantidad: 1 });
  };

  const guardarVenta = async () => {
    if (items.length === 0) return;
    await api.post('/ventas', {
      cliente_id: form.cliente_id || null,
      usuario_id: usuario.id,
      tipo_pago: form.tipo_pago,
      items,
    });
    cargarVentas();
    cerrarModal();
  };

  const ventasFiltradas = ventas.filter(v =>
    v.id.toString().includes(busqueda) ||
    (v.cliente || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-60 flex-1 flex flex-col">
        <Navbar titulo="Ventas" />
        <main className="mt-16 p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-800 font-semibold text-lg">Registro de ventas</h2>
              <p className="text-slate-400 text-sm mt-0.5">{ventas.length} ventas registradas</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportarVentasExcel(ventasFiltradas)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
              >
                <FileSpreadsheet size={16} />
                Excel
              </button>
              <button
                onClick={() => exportarVentasPDF(ventasFiltradas)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
              >
                <FileText size={16} />
                PDF
              </button>
              <button
                onClick={() => setModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
              >
                <Plus size={16} />
                Nueva venta
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por cliente o número..."
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
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">#</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Cliente</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Vendedor</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Total</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Pago</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Fecha</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Ticket</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                      No hay ventas registradas
                    </td>
                  </tr>
                ) : (
                  ventasFiltradas.map((v) => (
                    <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-5 py-4 text-slate-500 font-mono">#{v.id}</td>
                      <td className="px-5 py-4 text-slate-800 font-medium">{v.cliente || 'Cliente general'}</td>
                      <td className="px-5 py-4 text-slate-600">{v.vendedor}</td>
                      <td className="px-5 py-4 text-slate-800 font-semibold">S/ {parseFloat(v.total).toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full capitalize">
                          {v.tipo_pago}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {new Date(v.creado_en).toLocaleDateString('es-PE', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => imprimirTicket(v.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                          title="Imprimir ticket"
                        >
                          <Printer size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal nueva venta */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 text-lg">Nueva venta</h3>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Cliente y tipo de pago */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cliente</label>
                <select
                  value={form.cliente_id}
                  onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">Cliente general</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tipo de pago</label>
                <select
                  value={form.tipo_pago}
                  onChange={(e) => setForm({ ...form, tipo_pago: e.target.value })}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="yape_plin">Yape / Plin</option>
                </select>

                {/* Calculadora de vuelto */}
                {form.tipo_pago === 'efectivo' && (
                  <div className="mt-3 bg-white border border-slate-200 rounded-lg p-3">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Monto recibido</label>
                    <input
                      type="number"
                      value={montoRecibido}
                      onChange={(e) => setMontoRecibido(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                    {montoRecibido && parseFloat(montoRecibido) >= total && total > 0 && (
                      <div className="mt-2 flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
                        <span className="text-xs font-medium text-emerald-700">Vuelto</span>
                        <span className="text-lg font-bold text-emerald-700">
                          S/ {(parseFloat(montoRecibido) - total).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {montoRecibido && parseFloat(montoRecibido) < total && (
                      <div className="mt-2 flex items-center justify-between bg-red-50 rounded-lg px-3 py-2">
                        <span className="text-xs font-medium text-red-600">Monto insuficiente</span>
                        <span className="text-lg font-bold text-red-600">
                          S/ {(total - parseFloat(montoRecibido)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Escáner */}
            <div className="bg-slate-50 rounded-lg p-4 mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Escáner de código de barras</p>
              <div className="flex gap-3">
                <input
                  ref={escanerRef}
                  type="text"
                  value={codigoEscaner}
                  onChange={(e) => setCodigoEscaner(e.target.value)}
                  onKeyDown={handleEscaner}
                  placeholder={escaneando ? 'Escanea el producto...' : 'Activa el escáner primero'}
                  disabled={!escaneando}
                  className={`flex-1 border rounded-lg px-3 py-2.5 text-sm outline-none font-mono ${
                    escaneando
                      ? 'border-blue-500 bg-blue-50 animate-pulse'
                      : 'border-slate-200 bg-slate-100 text-slate-400'
                  }`}
                />
                <button
                  onClick={() => {
                    setEscaneando(!escaneando);
                    setErrorEscaner('');
                    setTimeout(() => escanerRef.current?.focus(), 100);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition ${
                    escaneando
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <Scan size={16} />
                  {escaneando ? 'Escaneando...' : 'Activar escáner'}
                </button>
              </div>
              {errorEscaner && (
                <p className="text-xs text-red-500 mt-2">{errorEscaner}</p>
              )}
              {escaneando && (
                <p className="text-xs text-blue-600 mt-2">Apunta el escáner al código de barras — se agregará automáticamente al carrito</p>
              )}
            </div>

            {/* Agregar producto manual */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Agregar producto manualmente</p>
              <div className="flex gap-3">
                <select
                  value={form.producto_id}
                  onChange={(e) => setForm({ ...form, producto_id: e.target.value })}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} — S/ {parseFloat(p.precio).toFixed(2)}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={form.cantidad}
                  onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                  className="w-20 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Cant."
                />
                <button
                  onClick={agregarItemManual}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Lista de items */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Producto</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Precio</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Cant.</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Subtotal</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400 text-sm">
                        Agrega productos escaneando o seleccionando manualmente
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.producto_id} className="border-b border-slate-100">
                        <td className="px-4 py-3 text-slate-800 font-medium">{item.nombre}</td>
                        <td className="px-4 py-3 text-slate-600">S/ {item.precio_unitario.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-600">{item.cantidad}</td>
                        <td className="px-4 py-3 text-slate-800 font-semibold">S/ {item.subtotal.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => quitarItem(item.producto_id)} className="text-slate-400 hover:text-red-500 transition">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total y botones */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total a cobrar</p>
                <p className="text-2xl font-bold text-slate-800">S/ {total.toFixed(2)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={cerrarModal}
                  className="border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarVenta}
                  disabled={items.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
                >
                  Registrar venta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}