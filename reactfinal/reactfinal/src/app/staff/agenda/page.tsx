'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

// --- INTERFACES ---
interface AdminPopulated { _id: string; nome: string; }
interface Oficina { _id: string; nome: string; morada: string; adminId: string | AdminPopulated; }
interface Agendamento {
  _id: string;
  veiculoId: { marca: string; modelo: string; matricula: string };
  clienteId: { nome: string };
  servico: string;
  data: string;
  turno: string;
  estado: string;
  oficinaId?: { nome: string; morada: string };
}
interface UserStorage { id?: string; _id?: string; role: string; oficina?: string; nome: string; }

export default function StaffAgendaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserStorage | null>(null);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  
  // Estados de UI
  const [oficinaExpandida, setOficinaExpandida] = useState<string | null>(null);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [itemExpandido, setItemExpandido] = useState<string | null>(null);
  const [mostrarCancelados, setMostrarCancelados] = useState(false);

  const carregarDadosIniciais = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) { router.push('/login'); return; }
      const userData: UserStorage = JSON.parse(userStr);
      const userId = userData.id || userData._id || '';
      setUser(userData);

      if (userData.role === 'cliente') {
        const res = await api.get<Agendamento[]>(`/agendamentos/cliente/${userId}`);
        setAgendamentos(res.data);
      } else {
        const resOficinas = await api.get<Oficina[]>('/oficinas');
        const filtradas = resOficinas.data.filter((of: Oficina) => {
          const idDono = typeof of.adminId === 'object' ? of.adminId._id : of.adminId;
          return userData.role === 'admin' ? String(idDono) === String(userId) : of._id === userData.oficina;
        });
        setOficinas(filtradas);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { carregarDadosIniciais(); }, []);

  const toggleOficina = async (oficinaId: string) => {
    if (oficinaExpandida === oficinaId) { setOficinaExpandida(null); return; }
    setOficinaExpandida(oficinaId);
    setLoadingAgenda(true);
    setItemExpandido(null);
    try {
      const res = await api.get<Agendamento[]>(`/agendamentos/oficina/${oficinaId}`);
      setAgendamentos(res.data);
    } catch (err) { alert("Erro ao carregar agenda"); } finally { setLoadingAgenda(false); }
  };

  const mudarEstado = async (id: string, novoEstado: string, contextId?: string) => {
    try {
      await api.patch(`/agendamentos/${id}/estado`, { estado: novoEstado });
      if (user?.role === 'cliente') {
        const res = await api.get<Agendamento[]>(`/agendamentos/cliente/${user.id || user._id}`);
        setAgendamentos(res.data);
      } else if (contextId) {
        const res = await api.get<Agendamento[]>(`/agendamentos/oficina/${contextId}`);
        setAgendamentos(res.data);
      }
    } catch (err) { alert("Erro ao atualizar estado"); }
  };

  const renderCard = (item: Agendamento, contextOficinaId?: string) => {
    const isAberto = itemExpandido === item._id;
    const isCancelado = item.estado === 'Cancelado';

    return (
      <div key={item._id} className={`rounded-2xl border transition-all duration-300 ${
          isAberto ? 'bg-slate-900 border-blue-500/40 shadow-inner' : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
        } ${isCancelado ? 'opacity-50 grayscale' : ''}`}>
        
        <div onClick={() => setItemExpandido(isAberto ? null : item._id)} className="p-5 flex justify-between items-center cursor-pointer select-none">
          <div className="flex gap-4 items-center">
            <div className={`w-1.5 h-10 rounded-full ${
              isCancelado ? 'bg-red-600' : item.estado === 'Pendente' ? 'bg-yellow-500' : 'bg-blue-400'
            }`} />
            <div>
              <p className="text-[9px] text-blue-400 font-bold uppercase">{item.turno} — {new Date(item.data).toLocaleDateString()}</p>
              <h4 className="text-sm font-black uppercase leading-tight">{item.veiculoId?.marca} {item.veiculoId?.modelo}</h4>
              <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{item.veiculoId?.matricula}</p>
            </div>
          </div>
          <span className={`text-[9px] font-black px-3 py-1 rounded border ${isCancelado ? 'text-red-500 border-red-500/20' : 'text-green-500 border-green-500/20'}`}>
            {item.estado}
          </span>
        </div>

        {isAberto && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-700/50 bg-slate-900/40 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div>
                <p className="text-[9px] text-slate-500 uppercase font-black mb-1 italic tracking-widest text-blue-400/60">Trabalho Solicitado:</p>
                <p className="text-xs text-slate-200 bg-slate-800 p-3 rounded-lg border border-slate-700">{item.servico}</p>
                <p className="mt-3 text-[9px] text-slate-500 uppercase font-black mb-1 italic">
                  {user?.role === 'cliente' ? 'Oficina:' : 'Cliente:'}
                  <span className="text-slate-300 font-bold uppercase ml-1">
                    {user?.role === 'cliente' ? item.oficinaId?.nome : item.clienteId?.nome}
                  </span>
                </p>
              </div>

              <div className="flex flex-col justify-end gap-2">
                {user?.role === 'cliente' ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); mudarEstado(item._id, isCancelado ? 'Pendente' : 'Cancelado'); }}
                    className={`w-full p-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${
                      isCancelado ? 'bg-green-600/20 text-green-500 border-green-500/30 hover:bg-green-600 hover:text-white' 
                                 : 'bg-red-600/20 text-red-500 border-red-500/30 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    {isCancelado ? '▶ REATIVAR' : '✖ CANCELAR'}
                  </button>
                ) : (
                  !isCancelado && user?.role === 'mecanico' && (
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); mudarEstado(item._id, 'Em curso', contextOficinaId); }} className="flex-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 p-2.5 rounded-xl text-[10px] font-black uppercase transition-all">▶ INICIAR</button>
                      <button onClick={(e) => { e.stopPropagation(); mudarEstado(item._id, 'Concluído', contextOficinaId); }} className="flex-1 bg-green-600/20 text-green-500 border border-green-500/30 p-2.5 rounded-xl text-[10px] font-black uppercase transition-all">✔ CONCLUIR</button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black italic text-blue-400 font-mono tracking-tighter uppercase border-b border-slate-800 pb-4 mb-10">Agenda</h1>

        <div className="space-y-6">
          {user?.role === 'cliente' ? (
            <>
              {/* ATIVOS */}
              <div className="space-y-3">
                {agendamentos.filter(a => a.estado !== 'Cancelado').length > 0 ? (
                  agendamentos.filter(a => a.estado !== 'Cancelado').map(item => renderCard(item))
                ) : (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-3xl text-slate-500 uppercase text-xs italic">Sem marcações ativas.</div>
                )}
              </div>

              {/* CANCELADOS */}
              {agendamentos.some(a => a.estado === 'Cancelado') && (
                <div className="mt-10">
                  <button onClick={() => setMostrarCancelados(!mostrarCancelados)} className="text-[10px] font-black uppercase text-slate-500 hover:text-red-400 flex items-center gap-2">
                    {mostrarCancelados ? 'Ocultar' : 'Ver'} Cancelados ({agendamentos.filter(a => a.estado === 'Cancelado').length}) {mostrarCancelados ? '▲' : '▼'}
                  </button>
                  {mostrarCancelados && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">{agendamentos.filter(a => a.estado === 'Cancelado').map(item => renderCard(item))}</div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* STAFF/ADMIN */
            oficinas.map((oficina) => {
              const isAberta = oficinaExpandida === oficina._id;
              // Filtra apenas o que não está cancelado para o staff
              const ativosNaOficina = agendamentos.filter(a => a.estado !== 'Cancelado');

              return (
                <div key={oficina._id} className={`rounded-3xl border transition-all duration-500 ${isAberta ? 'bg-slate-800 border-blue-500 shadow-2xl' : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'}`}>
                  <div onClick={() => toggleOficina(oficina._id)} className="p-8 flex justify-between items-center cursor-pointer group">
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight group-hover:text-blue-400 transition-colors">{oficina.nome}</h2>
                      <p className="text-slate-500 text-xs font-mono italic">{oficina.morada}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isAberta ? 'bg-blue-500 border-blue-500 rotate-45 text-white shadow-lg' : 'border-slate-700 bg-slate-900 group-hover:border-blue-400'}`}>
                      <span className="text-2xl font-light">+</span>
                    </div>
                  </div>

                  {isAberta && (
                    <div className="px-8 pb-8 pt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      {loadingAgenda ? (
                        <div className="text-center py-10 text-slate-500 animate-pulse font-mono uppercase text-[10px]">Acedendo...</div>
                      ) : ativosNaOficina.length > 0 ? (
                        ativosNaOficina.map((item) => renderCard(item, oficina._id))
                      ) : (
                        <div className="text-center py-10 text-slate-600 font-mono text-[10px] uppercase border border-dashed border-slate-800 rounded-2xl">Sem agendamentos ativos.</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}