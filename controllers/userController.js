const express = require('express');
const router = express.Router();
const User = require('../model/User');

router.post('/', async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  const user = new User({
    nombre,
    apellido,
    email,
    password
  });

  if (!nombre || !email || !password) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  const usuarioExistente = await User.findOne({ email });
  if (usuarioExistente) {
    return res.status(400).json({ mensaje: 'Este email ya está registrado' });
  }

  try {
    await user.save();
    res.status(201).json({ mensaje: 'Usuario creado con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el usuario' });
  }
});

module.exports = router;
