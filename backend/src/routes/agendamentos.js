const express = require('express');
const router = express.Router();
const Agendamento = require('../models/Agendamento');

// Criar agendamento
router.post('/', async (req, res) => {
  try {
    const novaMarcacao = new Agendamento(req.body);
    await novaMarcacao.save();
    res.status(201).json(novaMarcacao);
  } catch (err) {
    res.status(400).json({ msg: 'Erro ao processar agendamento' });
  }
});

// Listar agendamentos de uma oficina específica (Para o STAFF)
router.get('/oficina/:oficinaId', async (req, res) => {
  try {
    const { oficinaId } = req.params;
    const lista = await Agendamento.find({ oficinaId })
      .populate('veiculoId')
      .populate('clienteId', 'nome email')
      .sort({ data: 1 }); // Ordena por data (mais próximos primeiro)
    res.json(lista);
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao carregar agenda da oficina' });
  }
});

router.get('/cliente/:clienteId', async (req, res) => {
  try {
    const { clienteId } = req.params;
    const lista = await Agendamento.find({ clienteId })
      .populate('oficinaId', 'nome')
      .populate('veiculoId')
      .sort({ data: -1 });
    res.json(lista);
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao carregar histórico' });
  }
});
// Atualizar apenas o estado do agendamento (Iniciar/Concluir)
router.patch('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const agendamento = await Agendamento.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    res.json(agendamento);
  } catch (err) {
    res.status(400).json({ msg: 'Erro ao atualizar estado' });
  }
});
router.patch('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body; // Pode ser 'Pendente', 'Em curso', 'Concluído' ou 'Cancelado'
    const agendamento = await Agendamento.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    res.json(agendamento);
  } catch (err) {
    res.status(400).json({ msg: 'Erro ao atualizar estado' });
  }
});
module.exports = router;