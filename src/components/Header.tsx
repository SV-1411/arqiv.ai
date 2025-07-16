import React, { useState } from 'react';
import { useBook } from './BookContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Sparkles, User, LogOut, Home, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthModal } from './AuthModal';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  user: SupabaseUser | null;
  isAuthLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, isAuthLoading }) => {
  const location = useLocation();
  // Hide header only on the dedicated AI workspace page
  if (location.pathname === '/ai') {
    return null;
  }
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { goToPage } = useBook();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (isSigningOut) {
      console.log('⚠️ Sign out already in progress, ignoring click');
      return;
    }
    
    console.log('🔄 Starting sign out process...');
    setIsSigningOut(true);
    setIsUserMenuOpen(false);
    
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
      } else {
        console.log('✅ Successfully signed out from Supabase');
      }
      
    } catch (error) {
      console.error('❌ Unexpected error during sign out:', error);
    } finally {
      setIsSigningOut(false);
      console.log('✅ Sign out process completed');
    }
  };

  const handleAuthSuccess = () => {
    console.log('✅ Auth success callback triggered');
    setIsAuthModalOpen(false);
  };

  const getUserDisplayName = (user: SupabaseUser) => {
    return user.email?.split('@')[0] || 'User';
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-100/90 backdrop-blur-sm border-b border-surface-200/50 shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src="/aifinal.png" alt="arqivAi Logo" className="w-10 h-10" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold font-mono text-accent-500">
              arqivAi
            </h1>
          </div>

          {/* Desktop Navbar Links */}
          <div className="hidden sm:flex items-center space-x-6">
            <button onClick={() => {goToPage(0); navigate('/');}} className="flex items-center space-x-2 text-accent-500 hover:text-accent-600 transition-colors">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>

            <button onClick={() => {goToPage(1); navigate('/about');}} className="flex items-center space-x-2 text-accent-500 hover:text-accent-600 transition-colors">
              <Sparkles className="w-5 h-5" />
              <span>About Us</span>
            </button>

            <button onClick={() => {goToPage(2); navigate('/ai');}} className="flex items-center space-x-2 text-accent-500 hover:text-accent-600 transition-colors">
              <Brain className="w-5 h-5" />
              <span>AI</span>
            </button>

            {/* Auth Section */}
            <div>
              {isAuthLoading ? (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-white to-gray-50 border border-indigo-200 rounded-full px-4 py-2">
                  <div className="w-4 h-4 border-2 border-[#00bfff] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-indigo-600 text-sm">Loading...</span>
                </div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 bg-gradient-to-r from-white to-gray-50 border border-indigo-200 rounded-full px-4 py-2 text-indigo-800 hover:from-indigo-50 hover:to-indigo-100 transition-all duration-300 shadow-lg"
                    disabled={isSigningOut}
                  >
                    <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-900" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                      {getUserDisplayName(user)}
                    </span>
                  </button>

                  {/* User Menu Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-indigo-200 rounded-xl shadow-xl z-50">
                      <div className="p-3 border-b border-gray-600">
                        <p className="text-indigo-900 font-medium text-sm">{getUserDisplayName(user)}</p>
                        <p className="text-gray-400 text-xs truncate">{user.email}</p>
                      </div>
                      
                      <div className="p-2">
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="w-full flex items-center px-3 py-2 text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSigningOut ? (
                            <>
                              <svg className="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Signing Out...
                            </>
                          ) : (
                            <>
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign Out
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-2 bg-accent-500 text-white px-4 py-2 rounded-full hover:bg-accent-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign In</span>
                </button>
              )}
            </div>
          </div> {/* Added closing tag here */}
            {/* Mobile Hamburger */}
          <button className="sm:hidden text-accent-500 hover:text-accent-600" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-7 h-7" />
          </button>
        </nav>

        {/* Mobile Sidebar */}
        <div className={`fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-[#0f0f0f] via-[#1a1a1a] to-[#0b0b0b] text-white backdrop-blur-lg shadow-2xl rounded-l-3xl z-50 transform transition-transform duration-300 border-l-4 border-accent-500/60 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}> 
          <div className="flex items-center justify-between p-5 border-b border-gray-700">
            <h2 className="text-2xl font-extrabold tracking-wide text-accent-500">Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col px-6 py-6 space-y-5">
            <button onClick={() => { navigate('/'); goToPage(0); setIsSidebarOpen(false); }} className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-accent-500/20 transition-all transform hover:-translate-x-1 hover:shadow-lg text-accent-400 hover:text-white">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button onClick={() => { navigate('/about'); goToPage(1); setIsSidebarOpen(false); }} className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-accent-500/20 transition-all transform hover:-translate-x-1 hover:shadow-lg text-accent-400 hover:text-white">
              <Sparkles className="w-5 h-5" />
              <span>About Us</span>
            </button>
            <button onClick={() => { navigate('/ai'); setIsSidebarOpen(false); }} className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-accent-500/20 transition-all transform hover:-translate-x-1 hover:shadow-lg text-accent-400 hover:text-white">
              <Brain className="w-5 h-5" />
              <span>AI</span>
            </button>
            {user ? (
              <button onClick={() => {setIsUserMenuOpen(!isUserMenuOpen);}} className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-accent-500/20 transition-all transform hover:-translate-x-1 hover:shadow-lg text-accent-400 hover:text-white">
                <User className="w-5 h-5" />
                <span>Account</span>
              </button>
            ) : (
              <button onClick={() => {setIsAuthModalOpen(true); setIsSidebarOpen(false);}} className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-accent-500/20 transition-all transform hover:-translate-x-1 hover:shadow-lg text-accent-400 hover:text-white">
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
        {/* Overlay when sidebar open */}
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)} />}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
};