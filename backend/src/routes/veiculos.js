const express = require('express');
const router = express.Router();
const Veiculo = require('../models/Veiculo');


router.get('/cliente/:id', async (req, res) => {
  try {
    console.log("A receber pedido para o cliente ID:", req.params.id);
    
   
    const veiculos = await Veiculo.find({ clienteId: req.params.id });
    
    console.log("Veículos encontrados:", veiculos.length);
    res.json(veiculos);
  } catch (err) {
    console.error("Erro no servidor:", err);
    res.status(500).json({ msg: 'Erro ao procurar veículos' });
  }
});

// POST: /api/veiculos
router.post('/', async (req, res) => {
  try {
    // req.body deve conter: marca, modelo, matricula, ano e clienteId
    const novoVeiculo = new Veiculo(req.body);
    await novoVeiculo.save();
    res.status(201).json(novoVeiculo);
  } catch (err) {
    console.error("Erro ao guardar:", err);
    res.status(400).json({ msg: 'Erro ao guardar veículo ou matrícula duplicada' });
  }
});

module.exports = router;