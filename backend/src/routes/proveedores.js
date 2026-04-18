const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET todos los proveedores
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM proveedores ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST crear proveedor
router.post('/', async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;
  try {
    const resultado = await pool.query(
      'INSERT INTO proveedores (nombre, telefono, email, direccion) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, telefono, email, direccion]
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT editar proveedor
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, email, direccion } = req.body;
  try {
    const resultado = await pool.query(
      'UPDATE proveedores SET nombre=$1, telefono=$2, email=$3, direccion=$4 WHERE id=$5 RETURNING *',
      [nombre, telefono, email, direccion, id]
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE eliminar proveedor
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM proveedores WHERE id = $1', [id]);
    res.json({ mensaje: 'Proveedor eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;