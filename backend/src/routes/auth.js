const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Oficina = require('../models/Oficina'); // Precisas de importar o modelo da Oficina!

// REGISTO
router.post('/register', async (req, res) => {
  try {
    const { nome, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Utilizador já existe' });

    user = new User({ nome, email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.json({ msg: 'Utilizador registado com sucesso' });
  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
});

// LOGIN - Agora com busca automática de oficina
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Credenciais inválidas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciais inválidas' });

    // --- LÓGICA DE BUSCA: Ir à coleção Oficina procurar o utilizador ---
    let oficinaId = user.oficina; // Tenta o que está no User (geralmente null)

    // Se estiver vazio, vamos procurar na coleção Oficina quem tem este user na lista
    if (!oficinaId && (user.role === 'mecanico' || user.role === 'admin')) {
      const oficinaEncontrada = await Oficina.findOne({ mecanicos: user._id });
      if (oficinaEncontrada) {
        oficinaId = oficinaEncontrada._id;
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      'segredo_jwt_aqui', 
      { expiresIn: '1d' }
    );

    // Agora o JSON de resposta leva a oficina que encontrámos na outra tabela!
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        nome: user.nome, 
        role: user.role,
        oficina: oficinaId 
      } 
    });
  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
});

router.get('/mecanicos', async (req, res) => {
  try {
    const mecanicos = await User.find({ role: 'mecanico' });
    res.json(mecanicos);
  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;