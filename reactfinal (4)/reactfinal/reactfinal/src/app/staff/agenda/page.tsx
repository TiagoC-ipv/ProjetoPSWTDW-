'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import './StaffAgenda.css'; // Importação do teu CSS personalizado

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
      <div key={item._id} className={`agenda-card ${isAberto ? 'expandido' : ''} ${isCancelado ? 'cancelado' : ''}`}>
        
        <div onClick={() => setItemExpandido(isAberto ? null : item._id)} className="agenda-card-header">
          <div className="agenda-info-group">
            <div className={`status-indicator ${
              isCancelado ? 'status-cancelado' : item.estado === 'Pendente' ? 'status-pendente' : 'status-ativo'
            }`} />
            <div>
              <p className="card-label-mini">{item.turno} — {new Date(item.data).toLocaleDateString()}</p>
              <h4 className="card-veiculo-title">{item.veiculoId?.marca} {item.veiculoId?.modelo}</h4>
              <p className="card-matricula">{item.veiculoId?.matricula}</p>
            </div>
          </div>
          <span className={`badge-status ${isCancelado ? 'text-red' : 'text-green'}`}>
            {item.estado}
          </span>
        </div>

        {isAberto && (
          <div className="agenda-details">
            <div className="details-grid">
              <div>
                <p className="details-label">Trabalho Solicitado:</p>
                <div className="servico-box">{item.servico}</div>
                <p className="details-footer">
                  {user?.role === 'cliente' ? 'Oficina:' : 'Cliente:'}
                  <span className="details-footer-name">
                    {user?.role === 'cliente' ? item.oficinaId?.nome : item.clienteId?.nome}
                  </span>
                </p>
              </div>

              <div className="actions-column">
                {user?.role === 'cliente' ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); mudarEstado(item._id, isCancelado ? 'Pendente' : 'Cancelado'); }}
                    className={`btn-agenda ${isCancelado ? 'btn-reactivate' : 'btn-cancel'}`}
                  >
                    {isCancelado ? '▶ REATIVAR' : '✖ CANCELAR'}
                  </button>
                ) : (
                  !isCancelado && user?.role === 'mecanico' && (
                    <div className="btn-group">
                      <button onClick={(e) => { e.stopPropagation(); mudarEstado(item._id, 'Em curso', contextOficinaId); }} className="btn-agenda btn-start">▶ INICIAR</button>
                      <button onClick={(e) => { e.stopPropagation(); mudarEstado(item._id, 'Concluído', contextOficinaId); }} className="btn-agenda btn-done">✔ CONCLUIR</button>
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
    <main className="agenda-main">
      <div className="agenda-container">
        <h1 className="agenda-title">Agenda</h1>

        <div className="agenda-list">
          {user?.role === 'cliente' ? (
            <>
              <div className="cards-stack">
                {agendamentos.filter(a => a.estado !== 'Cancelado' && a.veiculoId).length > 0 ? (
                  agendamentos.filter(a => a.estado !== 'Cancelado' && a.veiculoId).map(item => renderCard(item))
                ) : (
                  <div className="empty-state">Sem marcações ativas.</div>
                )}
              </div>

              {agendamentos.some(a => a.estado === 'Cancelado' && a.veiculoId) && (
                <div className="cancelados-section">
                  <button onClick={() => setMostrarCancelados(!mostrarCancelados)} className="btn-ver-cancelados">
                    {mostrarCancelados ? 'Ocultar' : 'Ver'} Cancelados ({agendamentos.filter(a => a.estado === 'Cancelado' && a.veiculoId).length}) {mostrarCancelados ? '▲' : '▼'}
                  </button>
                  {mostrarCancelados && (
                    <div className="cards-stack fade-in-top">
                      {agendamentos.filter(a => a.estado === 'Cancelado' && a.veiculoId).map(item => renderCard(item))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            oficinas.map((oficina) => {
              const isAberta = oficinaExpandida === oficina._id;
              const ativosNaOficina = agendamentos.filter(a => a.estado !== 'Cancelado' && a.veiculoId);

              return (
                <div key={oficina._id} className={`oficina-card ${isAberta ? 'aberta' : ''}`}>
                  <div onClick={() => toggleOficina(oficina._id)} className="oficina-header">
                    <div className="oficina-info">
                      <h2 className="oficina-name">{oficina.nome}</h2>
                      <p className="oficina-address">{oficina.morada}</p>
                    </div>
                    <div className="plus-icon">
                      <span>+</span>
                    </div>
                  </div>

                  {isAberta && (
                    <div className="oficina-body">
                      {loadingAgenda ? (
                        <div className="loading-agenda">Acedendo...</div>
                      ) : ativosNaOficina.length > 0 ? (
                        ativosNaOficina.map((item) => renderCard(item, oficina._id))
                      ) : (
                        <div className="empty-state-dashed">Sem agendamentos ativos.</div>
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