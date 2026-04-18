const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/metricas', async (req, res) => {
  try {
    // Total de ventas
    const totalVentas = await pool.query('SELECT COUNT(*) FROM ventas');
    
    // Total de productos
    const totalProductos = await pool.query('SELECT COUNT(*) FROM productos WHERE activo = true');
    
    // Productos con stock bajo
    const stockBajo = await pool.query(
      'SELECT COUNT(*) FROM productos WHERE stock <= stock_minimo AND activo = true'
    );
    
    // Ventas de hoy
    const ventasHoy = await pool.query(
      `SELECT COALESCE(SUM(total), 0) as total 
       FROM ventas 
       WHERE DATE(creado_en) = CURRENT_DATE`
    );

    res.json({
      totalVentas: parseInt(totalVentas.rows[0].count),
      totalProductos: parseInt(totalProductos.rows[0].count),
      stockBajo: parseInt(stockBajo.rows[0].count),
      ventasHoy: parseFloat(ventasHoy.rows[0].total),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;