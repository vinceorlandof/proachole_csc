
import React, { useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';
import bcrypt from 'bcryptjs';
import { Activity, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await db.users.where('username').equals(username).first();
      
      if (!user || !user.password) {
        setError('Credenciais inválidas.');
        setLoading(false);
        return;
      }

      const isValidPassword = bcrypt.compareSync(password, user.password);
      
      if (!isValidPassword) {
        setError('Credenciais inválidas.');
        setLoading(false);
        return;
      }

      onLogin(user);
    } catch (err) {
      setError('Erro ao conectar ao banco de dados.');
      console.error(err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-sky-600 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg transform -rotate-3">
            <Activity size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ProAcolhe CSC</h1>
          <p className="text-slate-500 text-sm mt-2">Sistema de Apoio à Decisão Clínica</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-black"
                    placeholder="Digite seu usuário"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-black"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>
          </form>

          <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-xs font-bold text-blue-800 uppercase mb-2">Acesso de Demonstração</p>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Usuário: <code className="bg-white px-1 py-0.5 rounded border text-blue-600">gerente</code></span>
              <span>Senha: <code className="bg-white px-1 py-0.5 rounded border text-blue-600">ProAcolhe2025!</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
