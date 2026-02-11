'use client';

import { useEffect, useState, FormEvent } from 'react';
import api from '../../lib/api'; 
import './Veiculos.css';

interface Veiculo {
  _id?: string;
  marca: string;
  modelo: string;
  matricula: string;
  ano: number;
}

interface UserSession {
  id: string;
  _id?: string;
  nome: string;
  role: string;
}

interface ApiErrorResponse {
  response?: {
    data?: { msg?: string };
  };
}

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  const [mostrarForm, setMostrarForm] = useState<boolean>(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [marca, setMarca] = useState<string>('');
  const [modelo, setModelo] = useState<string>('');
  const [matricula, setMatricula] = useState<string>('');
  const [ano, setAno] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user: UserSession = JSON.parse(userString);
        const id = user.id || user._id || null;
        setUserId(id);
        if (id) fetchVeiculos(id);
      } catch (err) {
        setErro("Erro ao processar sessão.");
      }
    } else {
      setErro("Utilizador não autenticado.");
      setLoading(false);
    }
  }, []);

  const fetchVeiculos = async (id: string) => {
    try {
      const res = await api.get<Veiculo[]>(`/veiculos/cliente/${id}`);
      setVeiculos(res.data);
    } catch (err) {
      setErro("Erro ao carregar veículos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmeter = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const payload = { marca, modelo, matricula, ano, clienteId: userId };
    try {
      if (editandoId) {
        await api.put(`/veiculos/${editandoId}`, payload);
      } else {
        await api.post('/veiculos', payload);
      }
      cancelarEdicao();
      fetchVeiculos(userId);
    } catch (err) {
      const error = err as ApiErrorResponse;
      setErro(error.response?.data?.msg || "Erro ao processar veículo.");
    }
  };

  const handleApagar = async (id: string) => {
    if (!confirm("Deseja mesmo remover este veículo?")) return;
    try {
      await api.delete(`/veiculos/${id}`);
      if (userId) fetchVeiculos(userId);
    } catch (err) {
      setErro("Erro ao apagar veículo.");
    }
  };

  const prepararEdicao = (v: Veiculo) => {
    setEditandoId(v._id || null);
    setMarca(v.marca);
    setModelo(v.modelo);
    setMatricula(v.matricula);
    setAno(v.ano);
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setMarca(''); setModelo(''); setMatricula(''); setAno(new Date().getFullYear());
    setMostrarForm(false);
    setErro('');
  };

  if (loading) return <main className="veiculos-main"><p className="loading-state">A carregar garagem...</p></main>;

  return (
    <main className="veiculos-main">
      <div className="veiculos-container">
        <div className="veiculos-header">
          <h1 className="veiculos-title">
            🚗 Meus <span>Veículos</span>
          </h1>
          <button 
            onClick={() => mostrarForm ? cancelarEdicao() : setMostrarForm(true)}
            className={`btn-veiculo ${mostrarForm ? 'btn-gray' : 'btn-blue'}`}
          >
            {mostrarForm ? 'Fechar' : '+ Registar Carro'}
          </button>
        </div>

        {erro && <div className="error-banner">{erro}</div>}

        {mostrarForm && (
          <form onSubmit={handleSubmeter} className="veiculos-form">
            <h3 className="form-subtitle">
              {editandoId ? '🔧 Editar Veículo' : '📝 Novo Registo'}
            </h3>
            <div className="veiculos-form-grid">
              <input type="text" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} required />
              <input type="text" placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} required />
              <input type="text" placeholder="Matrícula" value={matricula} onChange={(e) => setMatricula(e.target.value.toUpperCase())} required />
              <input type="number" placeholder="Ano" value={ano} onChange={(e) => setAno(Number(e.target.value))} min="1900" required />
            </div>
            <button type="submit" className="btn-veiculo btn-green" style={{fontWeight: 900, letterSpacing: '0.1em'}}>
              {editandoId ? 'Atualizar' : 'Guardar Carro'}
            </button>
          </form>
        )}

        <div className="veiculos-list">
          {veiculos.length === 0 ? (
            <p className="empty-state" style={{textAlign: 'center', opacity: 0.5, fontStyle: 'italic', padding: '3rem'}}>Nenhum veículo registado.</p>
          ) : (
            veiculos.map((v) => (
              <div key={v._id} className="veiculo-card">
                <div className="veiculo-info">
                  <h2>{v.marca} <span style={{color: '#60a5fa'}}>{v.modelo}</span></h2>
                  <div className="veiculo-meta">
                    <span className="matricula-badge">{v.matricula}</span>
                    <span className="ano-text">Ano: {v.ano}</span>
                  </div>
                </div>
                
                <div className="flex-gap">
                  <button onClick={() => prepararEdicao(v)} className="btn-veiculo btn-edit">Editar</button>
                  <button onClick={() => v._id && handleApagar(v._id)} className="btn-veiculo btn-delete">Apagar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}