const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET todos los productos
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT p.*, c.nombre as categoria, pr.nombre as proveedor
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.activo = true
      ORDER BY p.id DESC
    `);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET buscar por código de barras
router.get('/barras/:codigo', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT p.*, c.nombre as categoria, pr.nombre as proveedor
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.codigo_barras = $1 AND p.activo = true
    `, [req.params.codigo]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET categorias y proveedores
router.get('/extras', async (req, res) => {
  try {
    const categorias = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    const proveedores = await pool.query('SELECT * FROM proveedores ORDER BY nombre');
    const relaciones = await pool.query('SELECT * FROM proveedor_categorias');
    res.json({
      categorias: categorias.rows,
      proveedores: proveedores.rows,
      relaciones: relaciones.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST crear producto
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, stock, stock_minimo, categoria_id, proveedor_id, codigo_barras } = req.body;
  try {
    const resultado = await pool.query(`
      INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo, categoria_id, proveedor_id, codigo_barras)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [nombre, descripcion, precio, stock, stock_minimo, categoria_id, proveedor_id, codigo_barras || null]);
    res.json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'El código de barras ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error del servidor' });
    }
  }
});

// PUT editar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, stock_minimo, categoria_id, proveedor_id, codigo_barras } = req.body;
  try {
    const resultado = await pool.query(`
      UPDATE productos
      SET nombre=$1, descripcion=$2, precio=$3, stock=$4, stock_minimo=$5, 
          categoria_id=$6, proveedor_id=$7, codigo_barras=$8
      WHERE id=$9
      RETURNING *
    `, [nombre, descripcion, precio, stock, stock_minimo, categoria_id, proveedor_id, codigo_barras || null, id]);
    res.json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'El código de barras ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error del servidor' });
    }
  }
});

// DELETE eliminar producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE productos SET activo = false WHERE id = $1', [id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;