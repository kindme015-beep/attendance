
import React, { useState } from 'react';
import AdminPortal from './components/admin/AdminPortal';
import UserPortal from './components/user/UserPortal';

type View = 'home' | 'admin' | 'user';

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);


export default function App() {
  const [view, setView] = useState<View>('home');

  const renderContent = () => {
    switch (view) {
      case 'admin':
        return <AdminPortal />;
      case 'user':
        return <UserPortal />;
      case 'home':
      default:
        return (
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Smart Attendance System</h1>
            <p className="text-lg text-slate-600 mb-10">Please select your login portal.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setView('admin')}
                className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
              >
                Admin Login
              </button>
              <button
                onClick={() => setView('user')}
                className="w-full sm:w-auto bg-teal-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-teal-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300"
              >
                User Login
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col items-center justify-center p-4">
       {view !== 'home' && (
         <nav className="absolute top-0 left-0 w-full p-4">
            <button 
                onClick={() => setView('home')} 
                className="flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            >
                <HomeIcon />
                Back to Home
            </button>
         </nav>
       )}
      <main className="w-full max-w-6xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}
