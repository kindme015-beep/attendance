
import React, { useState } from 'react';
import { getAdmins } from '../../services/storageService';
import type { Admin } from '../../types';

interface AdminLoginProps {
  onLoginSuccess: (admin: Admin) => void;
  onSwitchToSignup: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [id, setId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!id || !pin) {
      setError('ID and PIN are required.');
      return;
    }

    const admins = getAdmins();
    const foundAdmin = admins.find(admin => admin.id === id && admin.pin === pin);

    if (foundAdmin) {
      onLoginSuccess(foundAdmin);
    } else {
      setError('Invalid ID or PIN.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Admin Login</h2>
        <p className="text-center text-slate-500 mb-6">Access your dashboard.</p>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="adminId" className="block text-sm font-medium text-slate-700">Admin ID</label>
            <input
              id="adminId"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your admin ID"
            />
          </div>
          <div>
            <label htmlFor="adminPin" className="block text-sm font-medium text-slate-700">PIN</label>
            <input
              id="adminPin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your PIN"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="font-medium text-indigo-600 hover:text-indigo-500">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
