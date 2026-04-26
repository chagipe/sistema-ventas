const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Ventas por día (últimos 7 días)
router.get('/ventas-por-dia', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        TO_CHAR(creado_en, 'DD/MM') as dia,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
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

// Ventas por mes (últimos 6 meses)
router.get('/ventas-por-mes', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        TO_CHAR(creado_en, 'Mon YY') as mes,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE creado_en >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(creado_en, 'Mon YY'), TO_CHAR(creado_en, 'YYYY-MM')
      ORDER BY TO_CHAR(creado_en, 'YYYY-MM')
    `);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Productos más vendidos
router.get('/productos-top', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        p.nombre,
        SUM(dv.cantidad) as cantidad,
        SUM(dv.subtotal) as total
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      GROUP BY p.nombre
      ORDER BY cantidad DESC
      LIMIT 5
    `);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Ventas por tipo de pago
router.get('/ventas-por-pago', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        tipo_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      GROUP BY tipo_pago
    `);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;