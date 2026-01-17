
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const backgroundClass = 'bg-gradient-to-b from-green-400 via-yellow-100 to-orange-300';

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isHome = location.pathname === '/' || location.pathname === '/role-select' || location.pathname === '/auth';
  const isProfile = location.pathname === '/profile';

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${backgroundClass} overflow-x-hidden`}>
      {/* Header - Cleaned up: removed blur and background */}
      {!isHome && (
        <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-transparent">
           <div className="flex items-center">
            {location.pathname !== '/student/dashboard' && location.pathname !== '/counselor/dashboard' && (
               <button 
               onClick={handleBack}
               className="p-2 rounded-full bg-white/40 hover:bg-white/60 transition mr-2 text-green-900 shadow-sm"
             >
               <ChevronLeft className="w-6 h-6" />
             </button>
            )}
          </div>

          <div className="flex items-center gap-3">
             {isAuthenticated && !isProfile && (
              <button
                onClick={handleProfileClick}
                className="p-2 rounded-full bg-white/40 hover:bg-white/60 transition shadow-sm text-green-900"
                aria-label="Profile"
              >
                <User className="w-6 h-6" />
              </button>
            )}
            
            {isAuthenticated && (
                <button 
                    onClick={() => { logout(); navigate('/'); }}
                    className="text-xs font-bold text-green-900 hover:text-green-700 underline px-2 py-1 bg-white/20 rounded-lg"
                >
                    Logout
                </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`w-full max-w-md mx-auto min-h-screen flex flex-col ${!isHome ? 'pt-20' : ''} px-6 pb-10`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
