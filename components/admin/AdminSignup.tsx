import React, { useState, useEffect } from 'react';
import { addAdmin, getAdmins } from '../../services/storageService';
import type { Admin } from '../../types';

interface AdminSignupProps {
  onSignupSuccess: (admin: Admin) => void;
  onSwitchToLogin: () => void;
}

const AdminSignup: React.FC<AdminSignupProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [id, setId] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [hasExistingAdmin, setHasExistingAdmin] = useState(false);

  useEffect(() => {
    setHasExistingAdmin(getAdmins().length > 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!id || !pin || !confirmPin) {
      setError('All fields are required.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    if(hasExistingAdmin){
        setError('An admin account already exists. Multiple admin accounts are not supported in this version.');
        return;
    }

    const newAdmin = { id, pin };
    const success = addAdmin(newAdmin);

    if (success) {
      setMessage('Admin account created successfully! Logging in...');
      setTimeout(() => onSignupSuccess(newAdmin), 1500);
    } else {
      setError('An admin with this ID already exists.');
    }
  };
  
  const formContent = (
    <>
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Create Admin Account</h2>
      <p className="text-center text-slate-500 mb-6">Set up your administrative access.</p>
      
      <div className="mb-6 p-3 bg-indigo-50 border border-indigo-200 rounded-md text-sm text-indigo-800">
        <p><strong>Note:</strong> All data for this application is stored securely in your local browser storage and is not shared online.</p>
      </div>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
      {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="adminId" className="block text-sm font-medium text-slate-700">Admin ID</label>
          <input
            id="adminId"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Choose an admin ID"
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
            placeholder="Create a PIN"
          />
        </div>
        <div>
          <label htmlFor="confirmPin" className="block text-sm font-medium text-slate-700">Confirm PIN</label>
          <input
            id="confirmPin"
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Confirm your PIN"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Create Account
        </button>
      </form>
       <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="font-medium text-indigo-600 hover:text-indigo-500">
            Login
          </button>
        </p>
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        {hasExistingAdmin ? (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Admin Account Exists</h2>
                <p className="text-slate-600 mb-6">
                    An administrator account has already been created for this system. Please log in with the existing credentials.
                </p>
                <button onClick={onSwitchToLogin} className="w-full justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    Go to Login
                </button>
            </div>
        ) : formContent}
      </div>
    </div>
  );
};

export default AdminSignup;