
import React, { useState } from 'react';
import UserLogin from './UserLogin';
import UserDashboard from './UserDashboard';
import type { User } from '../../types';

export default function UserPortal() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-6">
      {currentUser ? (
        <UserDashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <UserLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
