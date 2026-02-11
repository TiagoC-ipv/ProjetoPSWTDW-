'use client';
import { useState } from 'react';
import api from '../../lib/api'; 
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import './register.css'; // Certifica-te que o ficheiro existe

interface BackendError {
  msg: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    role: 'cliente'
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert('Utilizador registado com sucesso!');
      router.push('/login');
    } catch (err) {
      const axiosError = err as AxiosError<BackendError>;
      if (axiosError.response && axiosError.response.data) {
        alert(axiosError.response.data.msg);
      } else {
        alert('Erro ao ligar ao servidor.');
      }
      console.log("Informação de debug:", axiosError.response?.data);
    }
  };

  return (
    <div className="register-container">
      <h1 className="register-title">Criar Nova Conta</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <input 
          type="text" 
          placeholder="Nome completo" 
          className="register-input"
          required
          onChange={(e) => setFormData({...formData, nome: e.target.value})} 
        />
        <input 
          type="email" 
          placeholder="Email" 
          className="register-input"
          required
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="register-input"
          required
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
        />
        
        <label className="register-label">Tipo de utilizador:</label>
        <select 
          className="register-select"
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
        >
          <option value="cliente">Cliente</option>
          <option value="mecanico">Mecânico</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" className="register-button">
          Registar
        </button>
      </form>
    </div>
  );
}