import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const imprimirTicket = async (ventaId) => {
  try {
    const res = await fetch(`http://localhost:3001/api/ventas/${ventaId}`);
    const venta = await res.json();

    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 200],
    });

    const ancho = 80;
    let y = 8;

    // Encabezado
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LICORERÍA', ancho / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Tu licorería de confianza', ancho / 2, y, { align: 'center' });
    y += 4;
    doc.text('Tel: 999-999-999', ancho / 2, y, { align: 'center' });
    y += 6;

    // Línea separadora
    doc.setLineWidth(0.3);
    doc.line(4, y, ancho - 4, y);
    y += 5;

    // Info de la venta
    doc.setFontSize(8);
    doc.text(`Ticket #${venta.id}`, 4, y);
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

    // Línea separadora
    doc.line(4, y, ancho - 4, y);
    y += 3;

    // Productos
    doc.setFont('helvetica', 'bold');
    doc.text('Producto', 4, y);
    doc.text('Cant.', 44, y);
    doc.text('Precio', 54, y);
    doc.text('Total', 66, y);
    y += 3;

    doc.setLineWidth(0.1);
    doc.line(4, y, ancho - 4, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    venta.detalle.forEach(item => {
      // Si el nombre es muy largo, lo cortamos
      const nombre = item.producto.length > 18
        ? item.producto.substring(0, 18) + '...'
        : item.producto;

      doc.text(nombre, 4, y);
      doc.text(`${item.cantidad}`, 44, y);
      doc.text(`S/${parseFloat(item.precio_unitario).toFixed(2)}`, 54, y);
      doc.text(`S/${parseFloat(item.subtotal).toFixed(2)}`, 66, y);
      y += 5;
    });

    // Línea separadora
    doc.setLineWidth(0.3);
    doc.line(4, y, ancho - 4, y);
    y += 5;

    // Total
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 4, y);
    doc.text(`S/ ${parseFloat(venta.total).toFixed(2)}`, ancho - 4, y, { align: 'right' });
    y += 8;

    // Pie de página
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.line(4, y, ancho - 4, y);
    y += 5;
    doc.text('¡Gracias por su compra!', ancho / 2, y, { align: 'center' });
    y += 4;
    doc.text('Vuelva pronto', ancho / 2, y, { align: 'center' });

    // Abrir PDF en nueva pestaña para imprimir
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');

  } catch (error) {
    console.error('Error generando ticket:', error);
  }
};