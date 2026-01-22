import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import AppLayout from './components/AppLayout';
import DashboardExcel from './components/DashboardExcel';
import MovementHistory from './components/MovementHistory';
import LoanDetails from './components/LoanDetails';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import { User, UserRole } from './types';

interface AppRouterProps {
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

const AppRouter: React.FC<AppRouterProps> = ({ currentUser, onLogin, onLogout }) => {
  if (!currentUser) {
    return <Login onLogin={onLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={currentUser} />} />
        <Route element={<AppLayout user={currentUser} onLogout={onLogout} />}>
          <Route path="/inventory" element={<DashboardExcel user={currentUser} />} />
          <Route path="/users" element={currentUser.role === UserRole.SUPER_ADMIN ? <UserManagement /> : <Navigate to="/" />} />
          <Route path="/audits" element={<MovementHistory />} />
          <Route path="/loans" element={<LoanDetails />} />
          <Route path="/reports" element={<div>Reportes (próximamente)</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 
