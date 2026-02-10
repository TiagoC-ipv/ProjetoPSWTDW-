'use client';

import { useEffect, useState, FormEvent } from 'react';
import api from '../../lib/api'; 

// 1. Definição do contrato de dados (Interfaces)
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

// Interface para capturar erros do Axios de forma tipada
interface ApiErrorResponse {
  response?: {
    data?: {
      msg?: string;
    };
    status?: number;
  };
  message: string;
}

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  const [mostrarForm, setMostrarForm] = useState<boolean>(false);
  const [marca, setMarca] = useState<string>('');
  const [modelo, setModelo] = useState<string>('');
  const [matricula, setMatricula] = useState<string>('');
  const [ano, setAno] = useState<number>(2025);

  useEffect(() => {
    const carregarDados = () => {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user: UserSession = JSON.parse(userString);
          const id = user.id || user._id || null;
          setUserId(id);
          if (id) fetchVeiculos(id);
        } catch (e) {
          setErro("Erro ao processar sessão.");
        }
      } else {
        setErro("Utilizador não autenticado.");
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  const fetchVeiculos = async (id: string): Promise<void> => {
    try {
      // Indicamos ao axios que o retorno é um array de Veiculo
      const res = await api.get<Veiculo[]>(`/veiculos/cliente/${id}`);
      setVeiculos(res.data);
      setErro('');
    } catch (err) {
      const error = err as ApiErrorResponse;
      setErro(error.response?.data?.msg || "Erro ao carregar veículos.");
    } finally {
      setLoading(false);
    }
  };

  const handleNovoVeiculo = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!userId) return;
    
    try {
      await api.post('/veiculos', { 
        marca, 
        modelo, 
        matricula, 
        ano: Number(ano), 
        clienteId: userId 
      });
      
      setMarca(''); setModelo(''); setMatricula(''); setAno(2025);
      setMostrarForm(false);
      fetchVeiculos(userId);
    } catch (err) {
      const error = err as ApiErrorResponse;
      setErro(error.response?.data?.msg || "Erro ao adicionar veículo.");
    }
  };

  if (loading) return <p className="text-white p-8">A carregar garagem...</p>;

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold italic tracking-tight">🚗 Meus Veículos</h1>
        <button 
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition-colors"
        >
          {mostrarForm ? 'Cancelar' : '+ Registar Carro'}
        </button>
      </div>

      {erro && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg mb-6">
          {erro}
        </div>
      )}

      {mostrarForm && (
        <form onSubmit={handleNovoVeiculo} className="bg-slate-800 p-6 rounded-xl mb-6 space-y-4 shadow-2xl border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:border-blue-500" required />
            <input type="text" placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:border-blue-500" required />
            <input type="text" placeholder="Matrícula" value={matricula} onChange={(e) => setMatricula(e.target.value.toUpperCase())} className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:border-blue-500" required />
            <input type="number" placeholder="Ano" value={ano} onChange={(e) => setAno(Number(e.target.value))} className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:border-blue-500" required />
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 p-3 rounded font-black uppercase tracking-widest">Guardar na Base de Dados</button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {veiculos.length === 0 ? (
          <p className="text-slate-500 italic text-center py-10">Nenhum veículo registado.</p>
        ) : (
          veiculos.map((v) => (
            <div key={v._id || v.matricula} className="bg-slate-800 border-l-4 border-blue-500 rounded-xl p-6 shadow-md hover:scale-[1.01] transition-transform">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black uppercase">{v.marca} <span className="text-blue-400 font-normal">{v.modelo}</span></h2>
                  <p className="text-slate-400 mt-1 font-mono bg-slate-900 inline-block px-2 py-1 rounded border border-slate-700 tracking-tighter">
                    MATRÍCULA: {v.matricula}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-bold uppercase">Ano de Fabrico</p>
                  <p className="text-xl font-bold">{v.ano}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 text-center text-[10px] text-slate-600 uppercase tracking-widest">
        Sessão Ativa: {userId}
      </div>
    </main>
  );
}