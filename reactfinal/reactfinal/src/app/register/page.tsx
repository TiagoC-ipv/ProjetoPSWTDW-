'use client';
import { useState } from 'react';
import api from '../../lib/api'; 
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  // 1. Criar um estado para todos os campos
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    role: 'cliente' // Valor inicial do select
  });

  const router = useRouter();

  // 2. Função para lidar com o envio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Envia para http://localhost:4000/api/auth/register
      await api.post('/auth/register', formData);
      alert('Utilizador registado com sucesso!');
      router.push('/login'); // Redireciona após sucesso
    } catch (err) {
      console.error(err);
      alert('Erro ao registar. Verifica se o servidor está ligado.');
    }
  };

  return (
    <div className="p-8 flex flex-col items-center bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-black">Criar Nova Conta</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded shadow text-black">
        <input 
          type="text" 
          placeholder="Nome completo" 
          className="border p-2 rounded"
          required
          onChange={(e) => setFormData({...formData, nome: e.target.value})} 
        />
        <input 
          type="email" 
          placeholder="Email" 
          className="border p-2 rounded"
          required
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="border p-2 rounded"
          required
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
        />
        
        <label className="text-sm text-gray-600 -mb-3">Tipo de utilizador:</label>
        <select 
          className="border p-2 rounded bg-white"
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
        >
          <option value="cliente">Cliente</option>
          <option value="mecanico">Mecânico</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold transition-colors">
          Registar
        </button>
      </form>
    </div>
  );
}