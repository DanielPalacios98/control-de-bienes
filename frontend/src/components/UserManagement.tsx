
import React, { useState } from 'react';
import { User, UserRole, Branch } from '../types';
import { mockBranches, initialUsers } from '../services/mockData';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    role: UserRole.BRANCH_ADMIN,
    status: 'active'
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      ...newUser as User,
      id: `u-${Math.random().toString(36).substr(2, 9)}`,
    };
    setUsers([...users, user]);
    setIsModalOpen(false);
  };

  const inputClasses = "w-full border border-gray-300 bg-white text-gray-900 p-2.5 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium";

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administración de accesos para las bodegas Ala 21 y Ala 22.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md active:scale-95"
        >
          <i className="fas fa-user-plus"></i> Nuevo Administrador
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold border-b tracking-widest">
              <th className="px-6 py-4">Nombre / Rango</th>
              <th className="px-6 py-4">Email Institucional</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Asignación Ala</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-800">{u.name}</td>
                <td className="px-6 py-4 text-gray-600 font-medium">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[9px] font-extrabold uppercase ${u.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                  {u.branchId ? mockBranches.find(b => b.id === u.branchId)?.name.split('Ala').pop() : 'TOTAL'}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-[10px] text-green-600 font-extrabold uppercase">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Activo
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Alta de Administrador</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-lg"></i></button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Nombre Completo y Rango</label>
                <input required className={inputClasses} placeholder="Ej: Cap. Juan García" onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Email Militar</label>
                <input type="email" required className={inputClasses} placeholder="usuario@ala21.mil.ec" onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Sucursal / Bodega</label>
                <select className={inputClasses} onChange={e => setNewUser({...newUser, branchId: e.target.value})}>
                  <option value="">Seleccione asignación...</option>
                  {mockBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all">Crear Acceso</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
