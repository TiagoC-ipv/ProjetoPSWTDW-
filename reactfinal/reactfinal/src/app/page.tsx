'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState<{ nome: string; role: string } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
      setStatus('ready');
    };

    checkUser();
  }, []);

  // Se ainda estiver a carregar, mostra um ecrã neutro para evitar erros de tipos
  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-black">A carregar sistema...</div>;
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; // Força refresh limpo
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-black">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-blue-900 mb-2">Oficina Camões</h1>
        <div className="h-1 w-20 bg-blue-600 mx-auto rounded"></div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {!user ? (
          <>
            <Link href="/login" className="p-10 bg-white rounded-2xl shadow-md hover:border-blue-500 border-2 border-transparent text-center transition-all">
              <h2 className="text-3xl font-bold text-blue-600">Entrar</h2>
              <p className="text-gray-500 mt-2">Aceder à minha área</p>
            </Link>
            <Link href="/register" className="p-10 bg-blue-600 rounded-2xl shadow-md hover:bg-blue-700 text-center text-white transition-all">
              <h2 className="text-3xl font-bold">Registar</h2>
              <p className="text-blue-100 mt-2">Criar conta nova</p>
            </Link>
          </>
        ) : (
          <>
            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 text-center mb-4">
              <p className="text-lg">Bem-vindo, <span className="font-bold">{user.nome}</span></p>
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase font-mono">
                Sessão como: {user.role}
              </span>
            </div>

            {user.role === 'cliente' && (
              <>
                <Link href="/veiculos" className="p-8 bg-white rounded-xl shadow hover:shadow-lg text-center border-b-4 border-blue-500">
                  <h2 className="text-xl font-bold">🚗 Meus Veículos</h2>
                </Link>
                <Link href="/agendamento" className="p-8 bg-white rounded-xl shadow hover:shadow-lg text-center border-b-4 border-purple-500">
                  <h2 className="text-xl font-bold">📅 Marcar Serviço</h2>
                </Link>
              </>
            )}

            {user.role === 'mecanico' && (
              <Link href="/staff/agenda" className="md:col-span-2 p-10 bg-green-600 text-white rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold">🔧 Ver Trabalhos Pendentes</h2>
              </Link>
            )}

            {user.role === 'admin' && (
              <Link href="/admin/oficina" className="md:col-span-2 p-10 bg-red-600 text-white rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold">⚙️ Gerir Oficina</h2>
              </Link>
            )}

            <button onClick={handleLogout} className="md:col-span-2 mt-8 text-gray-400 hover:text-red-500 text-sm underline">
              Terminar Sessão (Sair)
            </button>
          </>
        )}
      </div>
    </div>
  );
}