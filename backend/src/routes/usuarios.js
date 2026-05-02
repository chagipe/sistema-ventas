const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET todos los usuarios
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nombre, email, rol, activo, creado_en FROM usuarios ORDER BY id DESC'
    );
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST crear usuario
router.post('/', async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const resultado = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, activo',
      [nombre, email, hashedPassword, rol]
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'El email ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error del servidor' });
    }
  }
});

// PUT editar usuario
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol, activo, password } = req.body;
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE usuarios SET nombre=$1, email=$2, rol=$3, activo=$4, password=$5 WHERE id=$6',
        [nombre, email, rol, activo, hashedPassword, id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nombre=$1, email=$2, rol=$3, activo=$4 WHERE id=$5',
        [nombre, email, rol, activo, id]
      );
    }
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE desactivar usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE usuarios SET activo = false WHERE id = $1', [id]);
    res.json({ mensaje: 'Usuario desactivado' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});
// PUT actualizar perfil propio
router.put('/perfil/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, password } = req.body;
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE usuarios SET nombre=$1, password=$2 WHERE id=$3',
        [nombre, hashedPassword, id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nombre=$1 WHERE id=$2',
        [nombre, id]
      );
    }
    res.json({ mensaje: 'Perfil actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});
module.exports = router;