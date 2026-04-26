const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/metricas', async (req, res) => {
  try {
    const totalVentas = await pool.query('SELECT COUNT(*) FROM ventas');
    const totalProductos = await pool.query('SELECT COUNT(*) FROM productos WHERE activo = true');
    const stockBajo = await pool.query('SELECT COUNT(*) FROM productos WHERE stock <= stock_minimo AND activo = true');
    const ventasHoy = await pool.query(`SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE DATE(creado_en) = CURRENT_DATE`);

    res.json({
      totalVentas: parseInt(totalVentas.rows[0].count),
      totalProductos: parseInt(totalProductos.rows[0].count),
      stockBajo: parseInt(stockBajo.rows[0].count),
      ventasHoy: parseFloat(ventasHoy.rows[0].total),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/ventas-semana', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        TO_CHAR(creado_en, 'DD/MM') as dia,
        COALESCE(SUM(total), 0) as total,
        COUNT(*) as cantidad
      FROM ventas
      WHERE creado_en >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY TO_CHAR(creado_en, 'DD/MM'), DATE(creado_en)
      ORDER BY DATE(creado_en)
    `);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/productos-top', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT p.nombre, SUM(dv.cantidad) as cantidad, SUM(dv.subtotal) as total
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      JOIN ventas v ON dv.venta_id = v.id
      WHERE DATE(v.creado_en) = CURRENT_DATE
      GROUP BY p.nombre
      ORDER BY cantidad DESC
      LIMIT 3
    `);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/ultimas-ventas', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT v.*, c.nombre as cliente, u.nombre as vendedor
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      ORDER BY v.creado_en DESC
      LIMIT 5
    `);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/stock-bajo', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT nombre, stock, stock_minimo
      FROM productos
      WHERE stock <= stock_minimo AND activo = true
      ORDER BY stock ASC
      LIMIT 5
    `);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;