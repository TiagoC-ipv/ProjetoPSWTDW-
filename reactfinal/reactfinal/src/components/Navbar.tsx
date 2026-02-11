'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import './Navbar.css'; // Importação do CSS

interface User {
  nome: string;
  role: 'admin' | 'mecanico' | 'cliente';
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          if (pathname === '/login') {
            router.replace('/');
            return;
          }
          if (JSON.stringify(parsedUser) !== JSON.stringify(user)) {
            setUser(parsedUser);
          }
        } catch (e) {
          setUser(null);
        }
      } else {
        if (user !== null) setUser(null);
      }
    };

    checkUser();
  }, [pathname, router, user]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/login');
    router.refresh(); 
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link href="/" className="nav-logo">
          Oficina Camões
        </Link>
        
        {user && (
          <div className="user-nav-group">
            <Link href="/veiculos" className="nav-item">Veículos</Link>
            <Link href="/agendamento" className="nav-item">Agendar</Link>
            
            <Link href="/staff/agenda" className="nav-item nav-item-highlight">
              {user.role === 'cliente' ? 'Minhas Marcações' : 'Staff Agenda'}
            </Link>

            {user.role === 'admin' && (
              <Link href="/admin/oficina" className="btn-admin-badge">
                Admin
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="nav-right">
        {user ? (
          <div className="user-profile-box">
            <div className="user-info-text">
              <p className="user-name">{user.nome}</p>
              <p className="user-role">{user.role.toUpperCase()}</p>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Sair
            </button>
          </div>
        ) : (
          pathname !== '/login' && (
            <Link href="/login" className="btn-login">
              Entrar
            </Link>
          )
        )}
      </div>
    </nav>
  );
}