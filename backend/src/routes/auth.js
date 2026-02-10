// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTO
router.post('/register', async (req, res) => {
  try {
    const { nome, email, password, role } = req.body;

    // Verificar se utilizador já existe
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Utilizador já existe' });

    user = new User({ nome, email, password, role });

    // Encriptar password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.json({ msg: 'Utilizador registado com sucesso' });
  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Credenciais inválidas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciais inválidas' });

    // Criar Token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      'segredo_jwt_aqui', // Em produção usar process.env.JWT_SECRET
      { expiresIn: '1d' }
    );


// mecanicos route
router.get('/mecanicos', async (req, res) => {
  try {
    const mecanicos = await User.find({ role: 'mecanico' });
    res.json(mecanicos);
  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
});

    res.json({ token, user: { id: user._id, nome: user.nome, role: user.role } });
  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;