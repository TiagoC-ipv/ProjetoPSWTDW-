'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api'; 
import { useRouter } from 'next/navigation';
import './login.css'; // <--- Não esqueças de importar o CSS aqui

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
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
      
      router.push('/');
    } catch (err) {
      alert('Email ou password incorretos. Tenta novamente.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="login-title">Login Oficina</h2>
        
        <input 
          type="email" 
          placeholder="Email" 
          className="login-input"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          className="login-input"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" className="login-button">
          Entrar no Sistema
        </button>

        <p className="login-footer">
          Ainda não tem conta? <a href="/register" className="login-link">Registe-se aqui</a>
        </p>
      </form>
    </div>
  );
}