const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET movimientos de caja
router.get('/', async (req, res) => {
  try {
    const { fecha } = req.query;
    let query = `
      SELECT c.*, u.nombre as usuario
      FROM caja c
      LEFT JOIN usuarios u ON c.usuario_id = u.id
    `;
    const params = [];
    if (fecha) {
      query += ` WHERE DATE(c.creado_en) = $1`;
      params.push(fecha);
    }
    query += ` ORDER BY c.id DESC`;
    const resultado = await pool.query(query, params);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET resumen de caja
router.get('/resumen', async (req, res) => {
  try {
    const ingresos = await pool.query(`SELECT COALESCE(SUM(monto), 0) as total FROM caja WHERE tipo = 'ingreso' AND DATE(creado_en) = CURRENT_DATE`);
    const egresos = await pool.query(`SELECT COALESCE(SUM(monto), 0) as total FROM caja WHERE tipo = 'egreso' AND DATE(creado_en) = CURRENT_DATE`);
    const ventasHoy = await pool.query(`SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE DATE(creado_en) = CURRENT_DATE`);
    const totalIngresos = parseFloat(ingresos.rows[0].total);
    const totalEgresos = parseFloat(egresos.rows[0].total);
    const totalVentas = parseFloat(ventasHoy.rows[0].total);
    res.json({
      ingresos: totalIngresos,
      egresos: totalEgresos,
      ventas: totalVentas,
      balance: totalIngresos + totalVentas - totalEgresos,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET gráfica ingresos vs egresos últimos 7 días
router.get('/grafica', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        TO_CHAR(creado_en, 'DD/MM') as dia,
        DATE(creado_en) as fecha,
        COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) as ingresos,
        COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0) as egresos
      FROM caja
      WHERE creado_en >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY TO_CHAR(creado_en, 'DD/MM'), DATE(creado_en)
      ORDER BY DATE(creado_en)
    `);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET cierre de caja del día
router.get('/cierre', async (req, res) => {
  try {
    const ingresos = await pool.query(`SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as cantidad FROM caja WHERE tipo = 'ingreso' AND DATE(creado_en) = CURRENT_DATE`);
    const egresos = await pool.query(`SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as cantidad FROM caja WHERE tipo = 'egreso' AND DATE(creado_en) = CURRENT_DATE`);
    const ventas = await pool.query(`SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as cantidad FROM ventas WHERE DATE(creado_en) = CURRENT_DATE`);
    const porPago = await pool.query(`SELECT tipo_pago, COUNT(*) as cantidad, COALESCE(SUM(total), 0) as total FROM ventas WHERE DATE(creado_en) = CURRENT_DATE GROUP BY tipo_pago`);

    res.json({
      fecha: new Date().toLocaleDateString('es-PE'),
      ingresos: { total: parseFloat(ingresos.rows[0].total), cantidad: parseInt(ingresos.rows[0].cantidad) },
      egresos: { total: parseFloat(egresos.rows[0].total), cantidad: parseInt(egresos.rows[0].cantidad) },
      ventas: { total: parseFloat(ventas.rows[0].total), cantidad: parseInt(ventas.rows[0].cantidad) },
      porPago: porPago.rows,
      balance: parseFloat(ingresos.rows[0].total) + parseFloat(ventas.rows[0].total) - parseFloat(egresos.rows[0].total),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST registrar movimiento
router.post('/', async (req, res) => {
  const { tipo, monto, descripcion, usuario_id } = req.body;
  try {
    const resultado = await pool.query(`
      INSERT INTO caja (tipo, monto, descripcion, usuario_id)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [tipo, monto, descripcion, usuario_id]);
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;