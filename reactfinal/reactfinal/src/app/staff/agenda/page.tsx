'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface Agendamento {
  _id: string;
  veiculoId: { marca: string; modelo: string; matricula: string };
  clienteId: { nome: string };
  servico: string;
  data: string;
  turno: string;
  estado: string;
}

export default function StaffAgendaPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserRole(user.role);
      
      let res;
      if (user.role === 'cliente') {
        // Clientes veem as suas próprias marcações
        res = await api.get(`/agendamentos/cliente/${user.id || user._id}`);
      } else {
  // Staff vê as marcações da oficina associada
  if (!user.oficina) {
    console.error("User sem oficina:", user);
    setAgendamentos([]);
    setLoading(false);
    return;
  }
  res = await api.get(`/agendamentos/oficina/${user.oficina}`);
}

      setAgendamentos(res.data);
    } catch (err) {
      console.error("Erro ao carregar agenda", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const mudarEstado = async (id: string, novoEstado: string) => {
    try {
      await api.patch(`/agendamentos/${id}/estado`, { estado: novoEstado });
      carregarDados(); // Recarrega para atualizar a lista
    } catch (err) {
      alert("Erro ao atualizar estado");
    }
  };

  if (loading) return <div className="p-10 text-white font-mono">A carregar agenda...</div>;

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8 text-blue-400 font-mono italic uppercase tracking-tighter">
          {userRole === 'cliente' ? 'Minhas Marcações' : 'Agenda da Oficina'}
        </h1>

        <div className="space-y-4">
          {agendamentos.map((item) => (
            <div key={item._id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-between items-center shadow-xl">
              <div>
                <p className="text-xs text-blue-400 font-bold uppercase">{item.turno} — {new Date(item.data).toLocaleDateString()}</p>
                <h3 className="text-xl font-black uppercase">
                  {item.veiculoId?.marca} {item.veiculoId?.modelo} <span className="text-slate-500">({item.veiculoId?.matricula})</span>
                </h3>
                <p className="text-slate-400 font-mono text-sm">{item.servico}</p>
                <p className="mt-2 text-sm">
                  Estado: <span className={`font-bold uppercase ${item.estado === 'Pendente' ? 'text-yellow-500' : item.estado === 'Em curso' ? 'text-blue-400' : 'text-green-500'}`}>
                    {item.estado}
                  </span>
                </p>
              </div>

              {/* Ações: Só aparecem para Admin e Mecânico */}
              {userRole !== 'cliente' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => mudarEstado(item._id, 'Em curso')}
                    className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all"
                  > Iniciar </button>
                  <button 
                    onClick={() => mudarEstado(item._id, 'Concluído')}
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all"
                  > Concluir </button>
                </div>
              )}
            </div>
          ))}
          {agendamentos.length === 0 && <p className="text-slate-500 text-center font-mono uppercase">Sem registos encontrados.</p>}
        </div>
      </div>
    </main>
  );
}