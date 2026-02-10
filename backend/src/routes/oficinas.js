const express = require('express');
const router = express.Router();
const Oficina = require('../models/Oficina');
const User = require('../models/User');

// --- GET ---
router.get('/', async (req, res) => {
  try {
    const oficinas = await Oficina.find().populate('adminId', 'nome email');
    res.json(oficinas);
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao carregar oficinas' });
  }
});

// --- POST ---
router.post('/', async (req, res) => {
  try {
    const { nome, morada, telefone, adminId, vagasManha, vagasTarde } = req.body;
    const novaOficina = new Oficina({
      nome: nome.trim(),
      morada: morada.trim(),
      telefone: telefone?.trim() || '',
      adminId,
      vagasManha: Number(vagasManha) || 0,
      vagasTarde: Number(vagasTarde) || 0
    });
    await novaOficina.save();
    const resultado = await Oficina.findById(novaOficina._id).populate('adminId', 'nome email');
    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ msg: 'Erro ao criar' });
  }
});

// --- 1. ROTA DE ASSOCIAÇÃO (Mover para antes de /:id) ---
router.put('/associar-mecanico', async (req, res) => {
  try {
    const { mecanicoId, oficinaId } = req.body;

    // Atualiza o Mecânico no modelo User
    await User.findByIdAndUpdate(
      mecanicoId, 
      { oficina: oficinaId || null }, 
      { new: true }
    );

    // Sincroniza o array de mecânicos na Oficina
    if (oficinaId) {
      await Oficina.findByIdAndUpdate(
        oficinaId,
        { $addToSet: { mecanicos: mecanicoId } }
      );
    } else {
      await Oficina.updateMany(
        { mecanicos: mecanicoId },
        { $pull: { mecanicos: mecanicoId } }
      );
    }

    res.json({ msg: "Vínculo guardado com sucesso!" });
  } catch (err) {
    console.error("Erro associação:", err);
    res.status(400).json({ msg: 'Erro na associação. Verifica os IDs.' });
  }
});

// --- 2. ROTA GENÉRICA (Sempre por baixo das fixas) ---
router.put('/:id', async (req, res) => {
  try {
    const dados = { ...req.body };
    const oficina = await Oficina.findByIdAndUpdate(
      req.params.id, 
      { $set: dados }, 
      { new: true }
    ).populate('adminId', 'nome email');
    
    res.json(oficina);
  } catch (err) {
    res.status(400).json({ msg: 'Erro ao atualizar' });
  }
});

// --- SERVIÇOS ---
router.post('/:id/servicos', async (req, res) => {
  try {
    const { nome, preco, duracao } = req.body;
    const oficina = await Oficina.findByIdAndUpdate(
      req.params.id,
      { $push: { servicos: { nome, preco, duracao: Number(duracao) || 60 } } },
      { new: true }
    );
    res.json(oficina.servicos);
  } catch (err) {
    res.status(400).json({ msg: 'Erro ao adicionar serviço' });
  }
});

router.delete('/:oficinaId/servicos/:servicoId', async (req, res) => {
  try {
    const oficina = await Oficina.findByIdAndUpdate(
      req.params.oficinaId,
      { $pull: { servicos: { _id: req.params.servicoId } } },
      { new: true }
    );
    res.json(oficina.servicos);
  } catch (err) {
    res.status(400).json({ msg: 'Erro ao remover' });
  }
});

module.exports = router;