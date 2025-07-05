import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Sparkles, User, LogOut, Bookmark, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthModal } from './AuthModal';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  user: SupabaseUser | null;
  isAuthLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, isAuthLoading }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const location = useLocation();

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-lg border-b border-gray-700/50 shadow-lg">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src="/research.png" alt="ThinkVault Logo" className="w-10 h-10" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-[#00bfff] bg-clip-text text-transparent">
              ThinkVault
            </h1>
          </div>

          {/* Right side of Navbar */}
          <div className="flex items-center space-x-4">
            {location.pathname === '/saved' ? (
              <Link to="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
            ) : (
              <Link to="/saved" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Bookmark className="w-5 h-5" />
                <span>Saved</span>
              </Link>
            )}

            {/* Auth Section */}
            <div>
              {isAuthLoading ? (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] border border-gray-600 rounded-full px-4 py-2">
                  <div className="w-4 h-4 border-2 border-[#00bfff] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-400 text-sm">Loading...</span>
                </div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] border border-gray-600 rounded-full px-4 py-2 text-white hover:from-[#333333] hover:to-[#2a2a2a] transition-all duration-300 shadow-lg"
                    disabled={isSigningOut}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-[#00bfff] to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                      {getUserDisplayName(user)}
                    </span>
                  </button>

                  {/* User Menu Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] border border-gray-600 rounded-xl shadow-xl z-50">
                      <div className="p-3 border-b border-gray-600">
                        <p className="text-white font-medium text-sm">{getUserDisplayName(user)}</p>
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
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#00bfff] to-purple-500 text-white px-4 py-2 rounded-full hover:from-[#0099cc] hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </nav>
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