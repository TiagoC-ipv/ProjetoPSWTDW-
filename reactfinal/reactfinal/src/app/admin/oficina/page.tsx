'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

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
  oficina?: string; // ID da oficina associada
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

  if (loading) return <div className="p-8 text-white font-mono animate-pulse text-center uppercase tracking-widest">Sincronizando Sistema...</div>;

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-black italic text-blue-400 font-mono tracking-tighter uppercase">Gestão de Oficina</h1>
          <button 
            onClick={() => { setOficinaSelecionada(null); setShowForm(!showForm); }} 
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold transition-all uppercase text-xs"
          >
            {showForm ? 'Fechar' : '+ Nova Oficina'}
          </button>
        </div>

        {showForm && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl border border-blue-500/20 space-y-4 shadow-2xl">
              <h2 className="text-xl font-bold text-blue-400 mb-4 tracking-widest uppercase text-sm">Dados Principais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nome da Oficina" value={nome} onChange={e => setNome(e.target.value)} className="w-full p-4 bg-slate-900 rounded-xl outline-none border border-slate-700 focus:border-blue-500" required />
                <input type="text" placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full p-4 bg-slate-900 rounded-xl outline-none border border-slate-700" />
              </div>
              <input type="text" placeholder="Morada Completa" value={morada} onChange={e => setMorada(e.target.value)} className="w-full p-4 bg-slate-900 rounded-xl outline-none border border-slate-700" required />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <label className="text-[10px] text-slate-500 uppercase font-black mb-1 block">Vagas Manhã</label>
                  <input type="number" value={vagasManha} onChange={e => setVagasManha(Number(e.target.value))} className="w-full bg-transparent outline-none text-blue-400 font-bold text-xl" />
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <label className="text-[10px] text-slate-500 uppercase font-black mb-1 block">Vagas Tarde</label>
                  <input type="number" value={vagasTarde} onChange={e => setVagasTarde(Number(e.target.value))} className="w-full bg-transparent outline-none text-blue-400 font-bold text-xl" />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-blue-600 p-4 rounded-xl font-black uppercase hover:bg-blue-500 transition-all tracking-widest">
                {oficinaSelecionada ? 'Atualizar Configurações' : 'Criar Oficina'}
              </button>
            </form>

            {oficinaSelecionada && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Serviços */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-blue-400 font-black mb-4 uppercase text-xs tracking-widest italic">Catálogo de Serviços</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <input type="text" placeholder="Serviço" value={servicoNome} onChange={e => setServicoNome(e.target.value)} className="bg-slate-900 p-3 rounded-lg flex-1 min-w-[150px] outline-none text-sm" />
                    <input type="number" placeholder="Preço" value={servicoPreco} onChange={e => setServicoPreco(Number(e.target.value))} className="bg-slate-900 p-3 rounded-lg w-24 outline-none text-sm text-green-400 font-bold" />
                    <input type="number" placeholder="Min" value={servicoDuracao} onChange={e => setServicoDuracao(Number(e.target.value))} className="bg-slate-900 p-3 rounded-lg w-28 outline-none text-sm text-blue-400" />
                    <button onClick={handleAddServico} className="bg-green-600 px-4 rounded-lg font-bold hover:bg-green-500">+</button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {oficinas.find(o => o._id === oficinaSelecionada._id)?.servicos?.map((s) => (
                      <div key={s._id} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 group">
                        <div className="flex flex-col">
                           <span className="text-sm font-medium">{s.nome}</span>
                           <span className="text-[10px] text-slate-500 font-mono italic">⏳ {s.duracao} min</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-green-400 font-mono">{s.preco}€</span>
                          <button onClick={async () => {
                            await api.delete(`/oficinas/${oficinaSelecionada._id}/servicos/${s._id}`);
                            carregarDados();
                          }} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs uppercase font-bold">Apagar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Staff / Mecânicos */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-blue-400 font-black mb-4 uppercase text-xs tracking-widest italic">Equipa de Mecânicos</h3>
                  
                  <select 
                    onChange={async (e) => {
                      const selectedId = e.target.value;
                      if(!selectedId || !oficinaSelecionada) return;
                      
                      try {
                        await api.put<{ msg: string }>('/oficinas/associar-mecanico', { 
                          mecanicoId: selectedId, 
                          oficinaId: oficinaSelecionada._id 
                        });
                        await carregarDados(); 
                      } catch (err) {
                        alert("Erro na associação.");
                      }
                    }}
                    value="" 
                    className="w-full bg-slate-900 p-3 rounded-lg mb-6 outline-none text-sm border border-slate-700"
                  >
                    <option value="">Vincular Novo Mecânico...</option>
                    {/* FILTRO: Apenas mecânicos que NÃO têm oficina associada */}
                    {mecanicos
                      .filter(m => !m.oficina) 
                      .map(m => (
                        <option key={m._id} value={m._id}>{m.nome}</option>
                      ))
                    }
                  </select>

                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-2">Staff Atual:</p>
                    {mecanicos
                      .filter(m => m.oficina === oficinaSelecionada._id)
                      .map(m => (
                        <div key={m._id} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                          <span className="text-sm font-bold">{m.nome}</span>
                          <button 
                            onClick={async () => {
                              try {
                                await api.put('/oficinas/associar-mecanico', { 
                                  mecanicoId: m._id, 
                                  oficinaId: null 
                                });
                                await carregarDados();
                              } catch (err) {
                                console.error(err);
                              }
                            }} 
                            className="text-red-400 text-[10px] font-black uppercase hover:underline"
                          >
                            Desvincular
                          </button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TABELA DE LISTAGEM --- */}
        {!showForm && (
          <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-2xl mt-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                  <th className="p-5">Oficina</th>
                  <th className="p-5">Localização</th>
                  <th className="p-5 text-center">Vagas (M/T)</th>
                  <th className="p-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {oficinas.map((oficina) => {
                  const donoId = typeof oficina.adminId === 'object' ? oficina.adminId._id : oficina.adminId;
                  const eDono = String(donoId) === String(currentUserId);
                  return (
                    <tr key={oficina._id} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="p-5 font-black text-blue-400 uppercase tracking-tighter">{oficina.nome}</td>
                      <td className="p-5 text-slate-400 text-xs italic">{oficina.morada}</td>
                      <td className="p-5 text-center">
                        <span className="bg-slate-900 px-3 py-1 rounded-md text-[10px] font-mono border border-slate-700 text-blue-400 font-bold">
                          {oficina.vagasManha} / {oficina.vagasTarde}
                        </span>
                      </td>
                      <td className="p-5 text-right">
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
                            className="bg-blue-600/10 text-blue-400 border border-blue-600/50 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            Configurar
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">🔒 Restrito</span>
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