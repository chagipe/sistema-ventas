const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT c.*, COUNT(p.id) as total_productos
      FROM categorias c
      LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo = true
      GROUP BY c.id
      ORDER BY c.nombre
    `);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const resultado = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    } else {
      res.status(500).json({ error: 'Error del servidor' });
    }
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    const resultado = await pool.query(
      'UPDATE categorias SET nombre=$1, descripcion=$2 WHERE id=$3 RETURNING *',
      [nombre, descripcion, id]
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const productos = await pool.query(
      'SELECT COUNT(*) FROM productos WHERE categoria_id = $1 AND activo = true',
      [id]
    );
    if (parseInt(productos.rows[0].count) > 0) {
      return res.status(400).json({ error: 'No se puede eliminar, tiene productos asociados' });
    }
    await pool.query('DELETE FROM proveedor_categorias WHERE categoria_id = $1', [id]);
    await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;