const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET todas las ventas
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT v.*, c.nombre as cliente, u.nombre as vendedor
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      ORDER BY v.id DESC
    `);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET detalle de una venta
router.get('/:id', async (req, res) => {
  try {
    const venta = await pool.query(`
      SELECT v.*, c.nombre as cliente, u.nombre as vendedor
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = $1
    `, [req.params.id]);

    const detalle = await pool.query(`
      SELECT dv.*, p.nombre as producto
      FROM detalle_ventas dv
      LEFT JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = $1
    `, [req.params.id]);

    res.json({ ...venta.rows[0], detalle: detalle.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST crear venta
router.post('/', async (req, res) => {
  const { cliente_id, usuario_id, tipo_pago, items, descuento } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const totalSinDescuento = items.reduce((sum, item) => sum + item.subtotal, 0);
    const montoDescuento = (totalSinDescuento * (descuento || 0)) / 100;
    const total = totalSinDescuento - montoDescuento;

    const venta = await client.query(`
      INSERT INTO ventas (cliente_id, usuario_id, total, tipo_pago, descuento, total_sin_descuento)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [cliente_id, usuario_id, total, tipo_pago, descuento || 0, totalSinDescuento]);

    const ventaId = venta.rows[0].id;

    for (const item of items) {
      await client.query(`
        INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)
      `, [ventaId, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]);

      await client.query(`
        UPDATE productos SET stock = stock - $1 WHERE id = $2
      `, [item.cantidad, item.producto_id]);
    }

    await client.query('COMMIT');
    res.json(venta.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.release();
  }
});

module.exports = router;