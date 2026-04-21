import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Exportar ventas a Excel
export const exportarVentasExcel = (ventas) => {
  const datos = ventas.map(v => ({
    '#': v.id,
    'Cliente': v.cliente || 'Cliente general',
    'Vendedor': v.vendedor,
    'Total (S/)': parseFloat(v.total).toFixed(2),
    'Método de pago': v.tipo_pago === 'yape_plin' ? 'Yape/Plin' : v.tipo_pago,
    'Fecha': new Date(v.creado_en).toLocaleDateString('es-PE'),
  }));

  const hoja = XLSX.utils.json_to_sheet(datos);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Ventas');

  // Ancho de columnas
  hoja['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 20 },
    { wch: 12 }, { wch: 15 }, { wch: 15 }
  ];

  const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer]), `ventas_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`);
};

// Exportar ventas a PDF
export const exportarVentasPDF = (ventas) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Ventas', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['#', 'Cliente', 'Vendedor', 'Total', 'Pago', 'Fecha']],
    body: ventas.map(v => [
      `#${v.id}`,
      v.cliente || 'Cliente general',
      v.vendedor,
      `S/ ${parseFloat(v.total).toFixed(2)}`,
      v.tipo_pago === 'yape_plin' ? 'Yape/Plin' : v.tipo_pago,
      new Date(v.creado_en).toLocaleDateString('es-PE'),
    ]),
    headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`ventas_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.pdf`);
};

// Exportar inventario a Excel
export const exportarInventarioExcel = (productos) => {
  const datos = productos.map(p => ({
    'Producto': p.nombre,
    'Descripción': p.descripcion || '—',
    'Categoría': p.categoria || '—',
    'Proveedor': p.proveedor || '—',
    'Precio (S/)': parseFloat(p.precio).toFixed(2),
    'Stock actual': p.stock,
    'Stock mínimo': p.stock_minimo,
    'Estado': p.stock === 0 ? 'Sin stock' : p.stock <= p.stock_minimo ? 'Stock bajo' : 'Disponible',
  }));

  const hoja = XLSX.utils.json_to_sheet(datos);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Inventario');

  hoja['!cols'] = [
    { wch: 25 }, { wch: 20 }, { wch: 15 },
    { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];

  const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer]), `inventario_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`);
};

// Exportar inventario a PDF
export const exportarInventarioPDF = (productos) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Inventario', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['Producto', 'Categoría', 'Precio', 'Stock', 'Stock mín.', 'Estado']],
    body: productos.map(p => [
      p.nombre,
      p.categoria || '—',
      `S/ ${parseFloat(p.precio).toFixed(2)}`,
      p.stock,
      p.stock_minimo,
      p.stock === 0 ? 'Sin stock' : p.stock <= p.stock_minimo ? 'Stock bajo' : 'Disponible',
    ]),
    headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`inventario_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.pdf`);
};