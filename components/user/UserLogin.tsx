
import React, { useState } from 'react';
import { getUsers } from '../../services/storageService';
import type { User } from '../../types';

interface UserLoginProps {
  onLoginSuccess: (user: User) => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLoginSuccess }) => {
  const [id, setId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!id || !pin) {
      setError('User ID and PIN are required.');
      return;
    }

    const users = getUsers();
    const foundUser = users.find(user => user.id === id && user.pin === pin);

    if (foundUser) {
      onLoginSuccess(foundUser);
    } else {
      setError('Invalid User ID or PIN.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">User Login</h2>
        <p className="text-center text-slate-500 mb-6">Clock in to start your day.</p>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-slate-700">User ID</label>
            <input
              id="userId"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter your user ID"
            />
          </div>
          <div>
            <label htmlFor="userPin" className="block text-sm font-medium text-slate-700">PIN</label>
            <input
              id="userPin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter your PIN"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
