'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import './AdminOficina.css';

// --- INTERFACES ---
interface Servico {
  _id: string;
  nome: string;
  preco: number;
  duracao: number;
}

interface AdminPopulated {
  _id: string;
  nome: string;
  email?: string;
}

interface Oficina {
  _id: string;
  nome: string;
  morada: string;
  telefone: string;
  vagasManha: number;
  vagasTarde: number;
  adminId: string | AdminPopulated;
  servicos: Servico[];
}

interface User {
  _id: string;
  nome: string;
  role: string;
  oficina?: string;
}

export default function AdminOficinaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [oficinaSelecionada, setOficinaSelecionada] = useState<Oficina | null>(null);
  const [mecanicos, setMecanicos] = useState<User[]>([]);

  const [nome, setNome] = useState('');
  const [morada, setMorada] = useState('');
  const [telefone, setTelefone] = useState('');
  const [vagasManha, setVagasManha] = useState(5);
  const [vagasTarde, setVagasTarde] = useState(5);
  const [showForm, setShowForm] = useState(false);

  const [servicoNome, setServicoNome] = useState('');
  const [servicoPreco, setServicoPreco] = useState(0);
  const [servicoDuracao, setServicoDuracao] = useState(60);

  const carregarDados = async () => {
    try {
      const [resOficinas, resMecanicos] = await Promise.all([
        api.get<Oficina[]>('/oficinas'),
        api.get<User[]>('/auth/mecanicos')
      ]);
      setOficinas(resOficinas.data);
      setMecanicos(resMecanicos.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) { router.push('/login'); return; }
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') { router.push('/veiculos'); return; }
      
      setCurrentUserId(user.id || user._id || '');
      await carregarDados();
      setLoading(false);
    };
    init();
  }, [router]);

  const handleAddServico = async () => {
    if (!oficinaSelecionada) return;
    try {
      await api.post(`/oficinas/${oficinaSelecionada._id}/servicos`, {
        nome: servicoNome,
        preco: servicoPreco,
        duracao: Number(servicoDuracao)
      });
      setServicoNome('');
      setServicoPreco(0);
      setServicoDuracao(60);
      carregarDados();
    } catch (err) {
      alert("Erro ao adicionar serviço");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        nome, morada, telefone, 
        adminId: currentUserId, 
        vagasManha: Number(vagasManha), 
        vagasTarde: Number(vagasTarde) 
      };
      
      if (oficinaSelecionada) {
        await api.put(`/oficinas/${oficinaSelecionada._id}`, payload);
      } else {
        await api.post('/oficinas', payload);
      }
      
      alert("Operação realizada com sucesso!");
      setShowForm(false);
      carregarDados();
    } catch (err) {
      alert("Erro ao gravar dados.");
    }
  };

  if (loading) return <div className="loading-state">Sincronizando Sistema...</div>;

  return (
    <main className="admin-main">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Gestão de Oficina</h1>
          <button 
            onClick={() => { setOficinaSelecionada(null); setShowForm(!showForm); }} 
            className="btn-primary"
          >
            {showForm ? 'Fechar' : '+ Nova Oficina'}
          </button>
        </div>

        {showForm && (
          <div className="fade-in-animation">
            <form onSubmit={handleSubmit} className="admin-card">
              <h2 className="section-subtitle">Dados Principais</h2>
              <div className="form-grid">
                <input type="text" placeholder="Nome da Oficina" value={nome} onChange={e => setNome(e.target.value)} className="admin-input" required />
                <input type="text" placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} className="admin-input" />
              </div>
              <input type="text" placeholder="Morada Completa" value={morada} onChange={e => setMorada(e.target.value)} className="admin-input" style={{marginBottom: '1rem'}} required />
              
              <div className="grid-2nd">
                <div className="vagas-box">
                  <label className="vagas-label">Vagas Manhã</label>
                  <input type="number" value={vagasManha} onChange={e => setVagasManha(Number(e.target.value))} className="vagas-number" />
                </div>
                <div className="vagas-box">
                  <label className="vagas-label">Vagas Tarde</label>
                  <input type="number" value={vagasTarde} onChange={e => setVagasTarde(Number(e.target.value))} className="vagas-number" />
                </div>
              </div>
              
              <button type="submit" className="btn-primary" style={{width: '100%', padding: '1rem', marginTop: '1rem'}}>
                {oficinaSelecionada ? 'Atualizar Configurações' : 'Criar Oficina'}
              </button>
            </form>

            {oficinaSelecionada && (
              <div className="section-grid">
                {/* SERVIÇOS */}
                <div className="inner-card">
                  <h3 className="inner-title">Catálogo de Serviços</h3>
                  <div className="form-row-inline">
                    <input type="text" placeholder="Serviço" value={servicoNome} onChange={e => setServicoNome(e.target.value)} className="admin-input-sm" />
                    <input type="number" placeholder="€" value={servicoPreco} onChange={e => setServicoPreco(Number(e.target.value))} className="admin-input-sm-price" />
                    {/* CAMPO DE TEMPO ADICIONADO AQUI */}
                    <input type="number" placeholder="Min" value={servicoDuracao} onChange={e => setServicoDuracao(Number(e.target.value))} className="admin-input-sm-time" />
                    <button onClick={handleAddServico} className="btn-add-circle">+</button>
                  </div>
                  <div className="scroll-list">
                    {oficinas.find(o => o._id === oficinaSelecionada._id)?.servicos?.map((s) => (
                      <div key={s._id} className="list-item">
                        <div className="list-item-info">
                          <span className="list-item-name">{s.nome}</span>
                          <span className="list-item-detail">⏳ {s.duracao} min</span>
                        </div>
                        <div className="list-item-actions">
                          <span className="list-item-price">{s.preco}€</span>
                          <button onClick={async () => {
                            await api.delete(`/oficinas/${oficinaSelecionada._id}/servicos/${s._id}`);
                            carregarDados();
                          }} className="btn-delete">Apagar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STAFF */}
                <div className="inner-card">
                  <h3 className="inner-title">Equipa de Mecânicos</h3>
                  <select 
                    onChange={async (e) => {
                      const selectedId = e.target.value;
                      if(!selectedId || !oficinaSelecionada) return;
                      try {
                        await api.put('/oficinas/associar-mecanico', { 
                          mecanicoId: selectedId, 
                          oficinaId: oficinaSelecionada._id 
                        });
                        await carregarDados(); 
                      } catch (err) { alert("Erro na associação."); }
                    }}
                    className="admin-select"
                    value=""
                  >
                    <option value="">Vincular Novo Mecânico...</option>
                    {mecanicos.filter(m => !m.oficina).map(m => (
                      <option key={m._id} value={m._id}>{m.nome}</option>
                    ))}
                  </select>
                  <div className="staff-list">
                    {mecanicos.filter(m => m.oficina === oficinaSelecionada._id).map(m => (
                      <div key={m._id} className="list-item">
                        <span className="list-item-name">{m.nome}</span>
                        <button onClick={async () => {
                          try {
                            await api.put('/oficinas/associar-mecanico', { 
                              mecanicoId: m._id, 
                              oficinaId: null 
                            });
                            await carregarDados();
                          } catch (err) { console.error(err); }
                        }} className="btn-link-delete">Desvincular</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!showForm && (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Oficina</th>
                  <th>Localização</th>
                  <th style={{textAlign: 'center'}}>Vagas (M/T)</th>
                  <th style={{textAlign: 'right'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {oficinas.map((oficina) => {
                  const donoId = typeof oficina.adminId === 'object' ? oficina.adminId._id : oficina.adminId;
                  const eDono = String(donoId) === String(currentUserId);
                  return (
                    <tr key={oficina._id} className="table-row-group">
                      <td className="td-name">{oficina.nome}</td>
                      <td className="td-address">{oficina.morada}</td>
                      <td style={{textAlign: 'center'}}>
                        <span className="badge-vagas">{oficina.vagasManha} / {oficina.vagasTarde}</span>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        {eDono ? (
                          <button 
                            onClick={() => {
                              setOficinaSelecionada(oficina);
                              setNome(oficina.nome);
                              setMorada(oficina.morada);
                              setTelefone(oficina.telefone);
                              setVagasManha(oficina.vagasManha);
                              setVagasTarde(oficina.vagasTarde);
                              setShowForm(true);
                            }}
                            className="btn-config"
                          >
                            Configurar
                          </button>
                        ) : (
                          <span className="text-restricted">🔒 Restrito</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}