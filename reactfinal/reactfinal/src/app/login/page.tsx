'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api'; // Garante que o caminho para o axios está correto
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();


  useEffect(() => {
    const user = localStorage.getItem('user');
    // Se existir sessão, redireciona para a home ou dashboard
    if (user) {
      router.push('/'); 
    }
  }, [router]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
      const res = await api.post('/auth/login', { email, password });
      
    
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      alert(`Bem-vindo, ${res.data.user.nome}!`);
      
      // 3. Redirecionamento Inteligente (Baseado no Ponto 1 do enunciado)
      const role = res.data.user.role;
      if (role === 'admin') router.push('/oficina');
      else if (role === 'mecanico') router.push('/');
      else router.push('/');
      
    } catch (err) {
      alert('Email ou password incorretos. Tenta novamente.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-black">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-xl rounded-lg w-96 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login Oficina</h2>
        
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-3 mb-4 border rounded focus:outline-blue-500"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-3 mb-6 border rounded focus:outline-blue-500"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition-colors">
          Entrar no Sistema
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          Ainda não tem conta? <a href="/register" className="text-blue-600 hover:underline">Registe-se aqui</a>
        </p>
      </form>
    </div>
  );
}