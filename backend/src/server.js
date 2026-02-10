// server.js COMPLETO corrigido (copia tudo se precisares)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas de teste
app.get('/api/test', (req, res) => res.json({ ok: true, message: 'Backend MongoDB OK!' }));

// *** ADICIONA ESTE LOG DEBUG (nova linha) ***
app.use('/api/veiculos', (req, res, next) => {
  console.log('🔍 Veiculos route hit:', req.method, req.path, req.params);
  next();
}, require('./routes/veiculos'));

app.use('/api/agendamentos', require('./routes/agendamentos'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/oficinas', require('./routes/oficinas'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor http://localhost:${PORT}`));
