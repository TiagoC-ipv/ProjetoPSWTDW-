'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';

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
  
  // Estados para os dados
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário
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

        // Chamamos as duas APIs ao mesmo tempo
        const [resVeiculos, resOficinas] = await Promise.all([
          api.get(`/veiculos/cliente/${userId}`), // Rota que já tens no backend
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
      router.push('/'); // Redireciona para home ou lista de agendamentos
    } catch (err) {
      alert("Erro ao confirmar agendamento. Verifique se escolheu todos os campos.");
    }
  };

  if (loading) return <div className="p-10 text-white font-mono">A carregar os seus veículos...</div>;

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
        <h1 className="text-3xl font-black mb-6 text-blue-400 font-mono italic uppercase tracking-tighter">
          Novo Agendamento
        </h1>
        
        <form onSubmit={handleConfirmar} className="space-y-6">
          
          {/* SELEÇÃO DE VEÍCULO (Filtrado pelo ID logado) */}
          <div>
            <label className="text-xs uppercase text-slate-400 font-bold mb-2 block tracking-widest">
              Qual é o seu veículo?
            </label>
            <select 
              className="w-full bg-slate-900 p-4 rounded-xl border border-slate-700 focus:border-blue-500 outline-none transition-all"
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
              <p className="text-yellow-500 text-[10px] mt-2 font-bold uppercase">
                ⚠️ Não tem veículos registados. Vá a Meus Veículos primeiro.
              </p>
            )}
          </div>

          {/* SELEÇÃO DE OFICINA */}
          <div>
            <label className="text-xs uppercase text-slate-400 font-bold mb-2 block tracking-widest">
              Em qual oficina?
            </label>
            <select 
              className="w-full bg-slate-900 p-4 rounded-xl border border-slate-700 focus:border-blue-500 outline-none transition-all"
              value={oficinaSel} 
              onChange={e => {
                setOficinaSel(e.target.value);
                setServicoSel(''); // Limpa o serviço se mudar de oficina
              }} 
              required
            >
              <option value="">Selecione uma oficina disponível...</option>
              {oficinas.map(o => (
                <option key={o._id} value={o._id}>{o.nome}</option>
              ))}
            </select>
          </div>

          {/* SERVIÇOS DA OFICINA (Só aparece se houver oficina selecionada) */}
          <div>
            <label className="text-xs uppercase text-slate-400 font-bold mb-2 block tracking-widest">
              Serviço pretendido
            </label>
            <select 
              className="w-full bg-slate-900 p-4 rounded-xl border border-slate-700 focus:border-blue-500 outline-none transition-all"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs uppercase text-slate-400 font-bold mb-2 block tracking-widest">Data</label>
              <input 
                type="date" 
                min={new Date().toISOString().split("T")[0]} // Não deixa escolher datas passadas
                className="w-full bg-slate-900 p-4 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500" 
                value={dataSel} 
                onChange={e => setDataSel(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-400 font-bold mb-2 block tracking-widest">Turno</label>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setTurnoSel('manha')} 
                  className={`flex-1 p-4 rounded-xl font-black uppercase text-xs transition-all ${turnoSel === 'manha' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-700 text-slate-400'}`}
                >Manhã</button>
                <button 
                  type="button" 
                  onClick={() => setTurnoSel('tarde')} 
                  className={`flex-1 p-4 rounded-xl font-black uppercase text-xs transition-all ${turnoSel === 'tarde' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-700 text-slate-400'}`}
                >Tarde</button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-500 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-900/20"
          >
            Confirmar Marcação
          </button>
        </form>
      </div>
    </main>
  );
}