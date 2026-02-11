'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import './Agendamento.css'; // Importa o novo CSS

interface Veiculo { 
  _id: string; 
  marca: string; 
  modelo: string; 
  matricula: string; 
}

interface Oficina { 
  _id: string; 
  nome: string; 
  servicos?: { _id: string; nome: string; preco: number }[];
}

export default function AgendamentoPage() {
  const router = useRouter();
  
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [loading, setLoading] = useState(true);

  const [veiculoSel, setVeiculoSel] = useState('');
  const [oficinaSel, setOficinaSel] = useState('');
  const [servicoSel, setServicoSel] = useState('');
  const [dataSel, setDataSel] = useState('');
  const [turnoSel, setTurnoSel] = useState('manha');

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          router.push('/login');
          return;
        }
        const user = JSON.parse(userStr);
        const userId = user.id || user._id;

        const [resVeiculos, resOficinas] = await Promise.all([
          api.get(`/veiculos/cliente/${userId}`),
          api.get('/oficinas')
        ]);

        setVeiculos(resVeiculos.data);
        setOficinas(resOficinas.data);
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosIniciais();
  }, [router]);

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    try {
      const payload = {
        clienteId: user.id || user._id,
        veiculoId: veiculoSel,
        oficinaId: oficinaSel,
        servico: servicoSel,
        data: dataSel,
        turno: turnoSel
      };
      
      await api.post('/agendamentos', payload);
      alert("Marcação realizada com sucesso!");
      router.push('/');
    } catch (err) {
      alert("Erro ao confirmar agendamento.");
    }
  };

  if (loading) return <div className="loading-state">A carregar os seus veículos...</div>;

  return (
    <main className="agendamento-main">
      <div className="agendamento-card">
        <h1 className="agendamento-title">Novo Agendamento</h1>
        
        <form onSubmit={handleConfirmar}>
          
          <div className="form-group">
            <label className="label-mini">Qual é o seu veículo?</label>
            <select 
              className="agendamento-select"
              value={veiculoSel} 
              onChange={e => setVeiculoSel(e.target.value)} 
              required
            >
              <option value="">Escolha um dos seus carros...</option>
              {veiculos.map(v => (
                <option key={v._id} value={v._id}>
                  {v.marca} {v.modelo} — ({v.matricula})
                </option>
              ))}
            </select>
            {veiculos.length === 0 && (
              <p className="error-msg">⚠️ Não tem veículos registados.</p>
            )}
          </div>

          <div className="form-group">
            <label className="label-mini">Em qual oficina?</label>
            <select 
              className="agendamento-select"
              value={oficinaSel} 
              onChange={e => {
                setOficinaSel(e.target.value);
                setServicoSel('');
              }} 
              required
            >
              <option value="">Selecione uma oficina disponível...</option>
              {oficinas.map(o => (
                <option key={o._id} value={o._id}>{o.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label-mini">Serviço pretendido</label>
            <select 
              className="agendamento-select"
              value={servicoSel}
              onChange={e => setServicoSel(e.target.value)}
              required
              disabled={!oficinaSel}
            >
              <option value="">{oficinaSel ? "Escolha o serviço..." : "Escolha primeiro a oficina"}</option>
              {oficinas.find(o => o._id === oficinaSel)?.servicos?.map(s => (
                <option key={s._id} value={s.nome}>{s.nome} — {s.preco}€</option>
              ))}
            </select>
          </div>

          <div className="grid-row">
            <div>
              <label className="label-mini">Data</label>
              <input 
                type="date" 
                min={new Date().toISOString().split("T")[0]} 
                className="agendamento-input" 
                value={dataSel} 
                onChange={e => setDataSel(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="label-mini">Turno</label>
              <div className="flex-gap">
                <button 
                  type="button" 
                  onClick={() => setTurnoSel('manha')} 
                  className={`btn-turno ${turnoSel === 'manha' ? 'active' : ''}`}
                >Manhã</button>
                <button 
                  type="button" 
                  onClick={() => setTurnoSel('tarde')} 
                  className={`btn-turno ${turnoSel === 'tarde' ? 'active' : ''}`}
                >Tarde</button>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-confirmar">
            Confirmar Marcação
          </button>
        </form>
      </div>
    </main>
  );
}