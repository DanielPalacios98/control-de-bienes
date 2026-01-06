
import React, { useState } from 'react';
import { User } from '../types';
import { initialUsers } from '../services/mockData';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = initialUsers.find(u => u.email === email);
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales no válidas para esta demo. Use: super@invtrack.com');
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 font-medium shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-700/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 mb-4">
            <img src="/sello-fae-png.png" alt="Sello FAE" className="w-full h-full object-contain filter drop-shadow-xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Control de Bienes</h2>
          <p className="text-gray-500 mt-2 font-medium">Control de enseres de la Fuerza Aérea Ecuatoriana</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-bold">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2 tracking-wide">Correo Institucional</label>
            <input
              type="email"
              required
              className={inputClasses}
              placeholder="nombre@militar.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2 tracking-wide">Contraseña</label>
            <input
              type="password"
              required
              className={inputClasses}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <i className="fas fa-lock text-sm opacity-50"></i>
            Ingresar al Sistema
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-tighter">Acceso de Demostración</p>
          <code className="bg-gray-50 px-3 py-1.5 rounded-lg text-indigo-600 font-bold text-xs border border-gray-100 block">
            super@invtrack.com
          </code>
        </div>
      </div>
    </div>
  );
};

export default Login;
