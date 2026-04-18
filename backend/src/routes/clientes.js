const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;
  try {
    const resultado = await pool.query(
      'INSERT INTO clientes (nombre, telefono, email, direccion) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, telefono, email, direccion]
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;