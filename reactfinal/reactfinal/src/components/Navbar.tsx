'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white shadow-lg border-b border-gray-700 h-16">
      <div className="flex gap-6 items-center">
        <Link href="/" className="font-black text-blue-400 hover:text-blue-300 tracking-tighter uppercase italic">
          Oficina Camões
        </Link>
        
        {user && (
          <div className="flex gap-4 items-center border-l border-gray-600 pl-4 animate-in fade-in duration-500">
            <Link href="/veiculos" className="text-sm hover:text-blue-300 transition-colors">Veículos</Link>
            <Link href="/agendamento" className="text-sm hover:text-blue-300 transition-colors">Agendar</Link>
            
            {/* LINK DA AGENDA: Agora visível para todos, com nome dinâmico */}
            <Link href="/staff/agenda" className="text-sm text-yellow-500 font-bold hover:text-yellow-300 transition-colors">
              {user.role === 'cliente' ? 'Minhas Marcações' : 'Staff Agenda'}
            </Link>

            {user.role === 'admin' && (
              <Link href="/admin/oficina" className="bg-blue-600 px-3 py-1 rounded text-xs font-black hover:bg-blue-500 uppercase tracking-widest transition-all">
                Admin
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4 items-center">
        {user ? (
          <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
            <div className="text-right hidden sm:block leading-none">
              <p className="text-[10px] font-black uppercase text-white">{user.nome}</p>
              <p className="text-[9px] text-blue-400 font-mono font-bold tracking-widest">{user.role.toUpperCase()}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-600/10 text-red-500 border border-red-500/30 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-red-600 hover:text-white transition-all uppercase"
            >
              Sair
            </button>
          </div>
        ) : (
          pathname !== '/login' && (
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20">
              Entrar
            </Link>
          )
        )}
      </div>
    </nav>
  );
}