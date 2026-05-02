import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const NEGOCIO = {
  nombre: 'LICORERÍA',
  direccion: 'Av. Universitaria 7364',
  telefono: '994 248 626',
  ruc: '1234',
};

export const imprimirTicket = async (ventaId, montoRecibido = 0) => {
  try {
    const res = await fetch(`http://localhost:3001/api/ventas/${ventaId}`);
    const venta = await res.json();

    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 220],
    });

    const ancho = 80;
    let y = 8;

    // ── Encabezado ──
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(NEGOCIO.nombre, ancho / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(NEGOCIO.direccion, ancho / 2, y, { align: 'center' });
    y += 4;
    doc.text(`Tel: ${NEGOCIO.telefono}`, ancho / 2, y, { align: 'center' });
    y += 4;
    doc.text(`RUC: ${NEGOCIO.ruc}`, ancho / 2, y, { align: 'center' });
    y += 5;

    // ── Línea ──
    doc.setLineWidth(0.3);
    doc.line(4, y, ancho - 4, y);
    y += 5;

    // ── Info venta ──
    doc.setFontSize(8);
    doc.text(`Ticket N°: ${String(venta.id).padStart(6, '0')}`, 4, y);
    y += 4;
    doc.text(`Fecha: ${new Date(venta.creado_en).toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })}`, 4, y);
    y += 4;
    doc.text(`Vendedor: ${venta.vendedor}`, 4, y);
    y += 4;
    doc.text(`Cliente: ${venta.cliente || 'Cliente general'}`, 4, y);
    y += 4;
    doc.text(`Pago: ${venta.tipo_pago === 'yape_plin' ? 'Yape/Plin' : venta.tipo_pago}`, 4, y);
    y += 5;

    // ── Línea ──
    doc.line(4, y, ancho - 4, y);
    y += 4;

    // ── Encabezado productos ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Producto', 4, y);
    doc.text('Cant', 44, y);
    doc.text('P.Unit', 52, y);
    doc.text('Total', 66, y);
    y += 3;

    doc.setLineWidth(0.1);
    doc.line(4, y, ancho - 4, y);
    y += 4;

    // ── Productos ──
    doc.setFont('helvetica', 'normal');
    venta.detalle.forEach(item => {
      const nombre = item.producto.length > 18
        ? item.producto.substring(0, 18) + '...'
        : item.producto;
      doc.text(nombre, 4, y);
      doc.text(`${item.cantidad}`, 44, y);
      doc.text(`S/${parseFloat(item.precio_unitario).toFixed(2)}`, 52, y);
      doc.text(`S/${parseFloat(item.subtotal).toFixed(2)}`, 66, y);
      y += 5;
    });

    // ── Línea ──
    doc.setLineWidth(0.3);
    doc.line(4, y, ancho - 4, y);
    y += 5;

    // ── Subtotal, descuento, total ──
    const totalSinDescuento = parseFloat(venta.total_sin_descuento || venta.total);
    const descuento = parseFloat(venta.descuento || 0);
    const montoDescuento = (totalSinDescuento * descuento) / 100;
    const total = parseFloat(venta.total);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 4, y);
    doc.text(`S/ ${totalSinDescuento.toFixed(2)}`, ancho - 4, y, { align: 'right' });
    y += 5;

    if (descuento > 0) {
      doc.setTextColor(5, 150, 105);
      doc.text(`Descuento (${descuento}%):`, 4, y);
      doc.text(`- S/ ${montoDescuento.toFixed(2)}`, ancho - 4, y, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      y += 5;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 4, y);
    doc.text(`S/ ${total.toFixed(2)}`, ancho - 4, y, { align: 'right' });
    y += 6;

    // ── Vuelto ──
    if (montoRecibido && parseFloat(montoRecibido) > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Efectivo:', 4, y);
      doc.text(`S/ ${parseFloat(montoRecibido).toFixed(2)}`, ancho - 4, y, { align: 'right' });
      y += 5;

      const vuelto = parseFloat(montoRecibido) - total;
      if (vuelto >= 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Vuelto:', 4, y);
        doc.text(`S/ ${vuelto.toFixed(2)}`, ancho - 4, y, { align: 'right' });
        y += 5;
      }
    }

    // ── Pie ──
    doc.setLineWidth(0.3);
    doc.line(4, y, ancho - 4, y);
    y += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('¡Gracias por su compra!', ancho / 2, y, { align: 'center' });
    y += 4;
    doc.text('Vuelva pronto', ancho / 2, y, { align: 'center' });

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');

  } catch (error) {
    console.error('Error generando ticket:', error);
  }
};