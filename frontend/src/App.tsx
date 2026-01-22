



import React, { useState } from 'react';
import { User } from './types';
import AppRouter from './AppRouter';
import { useEffect } from 'react';
import { authAPI } from './services/api';

const App: React.FC = () => {
  // Initialize from localStorage synchronously so routes don't flash to Login on reload
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) as User : null;
    } catch (e) {
      console.error('Error parsing stored user', e);
      return null;
    }
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try { localStorage.setItem('currentUser', JSON.stringify(user)); } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try { localStorage.removeItem('currentUser'); } catch (e) { console.error(e); }
    try { localStorage.removeItem('token'); } catch (e) { console.error(e); }
    try { authAPI.logout(); } catch (e) { /* ignore */ }
  };

  // If we have a token but no currentUser, attempt to fetch /auth/me and set the user
  useEffect(() => {
    const tryRestore = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      if (currentUser) return;
      try {
        const me = await authAPI.getMe();
        const user: User = {
          id: me._id,
          email: me.email,
          name: me.name,
          role: me.role as any,
          branchId: me.branchId,
          status: 'active'
        };
        handleLogin(user);
      } catch (err) {
        console.error('Failed to restore session', err);
        handleLogout();
      }
    };
    tryRestore();
  }, [currentUser]);

  return <AppRouter currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />;
};

export default App;


