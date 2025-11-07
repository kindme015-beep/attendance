
import React, { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminSignup from './AdminSignup';
import AdminDashboard from './AdminDashboard';
import type { Admin } from '../../types';

type AdminView = 'login' | 'signup' | 'dashboard';

export default function AdminPortal() {
  const [view, setView] = useState<AdminView>('login');
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

  const handleLoginSuccess = (admin: Admin) => {
    setCurrentAdmin(admin);
    setView('dashboard');
  };

  const handleSignupSuccess = (admin: Admin) => {
    setCurrentAdmin(admin);
    setView('dashboard');
  }

  const handleLogout = () => {
    setCurrentAdmin(null);
    setView('login');
  };

  const renderAdminContent = () => {
    switch (view) {
      case 'signup':
        return <AdminSignup onSignupSuccess={handleSignupSuccess} onSwitchToLogin={() => setView('login')} />;
      case 'dashboard':
        return currentAdmin ? <AdminDashboard admin={currentAdmin} onLogout={handleLogout} /> : <AdminLogin onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => setView('signup')} />;
      case 'login':
      default:
        return <AdminLogin onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => setView('signup')} />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
        {renderAdminContent()}
    </div>
  );
}
