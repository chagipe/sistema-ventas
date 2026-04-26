const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET todos los proveedores con sus categorías
router.get('/', async (req, res) => {
  try {
    const proveedores = await pool.query('SELECT * FROM proveedores ORDER BY id DESC');
    const relaciones = await pool.query(`
      SELECT pc.proveedor_id, c.id as categoria_id, c.nombre as categoria
      FROM proveedor_categorias pc
      JOIN categorias c ON pc.categoria_id = c.id
    `);

    const resultado = proveedores.rows.map(p => ({
      ...p,
      categorias: relaciones.rows
        .filter(r => r.proveedor_id === p.id)
        .map(r => ({ id: r.categoria_id, nombre: r.categoria }))
    }));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET categorías disponibles
router.get('/categorias', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST crear proveedor
router.post('/', async (req, res) => {
  const { nombre, telefono, email, direccion, categorias } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await client.query(
      'INSERT INTO proveedores (nombre, telefono, email, direccion) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, telefono, email, direccion]
    );
    const proveedorId = resultado.rows[0].id;

    if (categorias && categorias.length > 0) {
      for (const categoriaId of categorias) {
        await client.query(
          'INSERT INTO proveedor_categorias (proveedor_id, categoria_id) VALUES ($1, $2)',
          [proveedorId, categoriaId]
        );
      }
    }

    await client.query('COMMIT');
    res.json(resultado.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.release();
  }
});

// PUT editar proveedor
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, email, direccion, categorias } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE proveedores SET nombre=$1, telefono=$2, email=$3, direccion=$4 WHERE id=$5',
      [nombre, telefono, email, direccion, id]
    );

    await client.query('DELETE FROM proveedor_categorias WHERE proveedor_id = $1', [id]);

    if (categorias && categorias.length > 0) {
      for (const categoriaId of categorias) {
        await client.query(
          'INSERT INTO proveedor_categorias (proveedor_id, categoria_id) VALUES ($1, $2)',
          [id, categoriaId]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ mensaje: 'Proveedor actualizado' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.release();
  }
});

// DELETE eliminar proveedor
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM proveedor_categorias WHERE proveedor_id = $1', [id]);
    await pool.query('DELETE FROM proveedores WHERE id = $1', [id]);
    res.json({ mensaje: 'Proveedor eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;