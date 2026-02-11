'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import './Home.css'; // <--- Importa o CSS aqui

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

  if (status === 'loading') {
    return <div className="home-loading">A carregar sistema...</div>;
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Oficina Camões</h1>
        <div className="header-decorator"></div>
      </header>
      
      <div className="home-grid">
        {!user ? (
          <>
            <Link href="/login" className="card-link card-white">
              <h2>Entrar</h2>
              <p>Aceder à minha área</p>
            </Link>
            <Link href="/register" className="card-link card-blue">
              <h2>Registar</h2>
              <p>Criar conta nova</p>
            </Link>
          </>
        ) : (
          <>
            <div className="user-welcome-card full-width">
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                Bem-vindo, <strong>{user.nome}</strong>
              </p>
              <span className="role-badge">
                Sessão como: {user.role}
              </span>
            </div>

            {user.role === 'cliente' && (
              <>
                <Link href="/veiculos" className="card-link card-cliente">
                  <h2>🚗 Meus Veículos</h2>
                </Link>
                <Link href="/agendamento" className="card-link card-agendamento">
                  <h2>📅 Marcar Serviço</h2>
                </Link>
              </>
            )}

            {user.role === 'mecanico' && (
              <Link href="/staff/agenda" className="card-link card-green full-width">
                <h2>🔧 Ver Trabalhos Pendentes</h2>
              </Link>
            )}

            {user.role === 'admin' && (
              <Link href="/admin/oficina" className="card-link card-red full-width">
                <h2>⚙️ Gerir Oficina</h2>
              </Link>
            )}

            <button onClick={handleLogout} className="logout-btn full-width">
              Terminar Sessão (Sair)
            </button>
          </>
        )}
      </div>
    </div>
  );
}