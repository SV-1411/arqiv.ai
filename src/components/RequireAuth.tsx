import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface RequireAuthProps {
  children: React.ReactNode;
  user: SupabaseUser | null;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, user }) => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowLoader(false), 1200); // ~1.2s loader
    return () => clearTimeout(t);
  }, []);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-[#121212] border border-accent-500 rounded-2xl p-8 text-center max-w-sm mx-auto shadow-2xl animate-pop">
          <h2 className="text-2xl font-bold text-accent-500 mb-4">Hold up, Einstein! 🔒</h2>
          <p className="text-gray-300 mb-6">Our AI is exclusive. Sign in first, then we'll let you blow your mind. 😉</p>
          <Link to="/" className="inline-block bg-gradient-to-r from-accent-500 to-pink-500 hover:to-yellow-400 text-white font-semibold px-6 py-3 rounded-full shadow-lg">Take me to Login</Link>
        </div>
      </div>
    );
  }

  if (showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/80">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent-500 via-pink-500 to-yellow-400 animate-spin-slow" />
            <div className="absolute inset-3 rounded-full bg-black flex items-center justify-center">
              <Brain className="w-12 h-12 text-accent-500 animate-pulse" />
            </div>
          </div>
          <div className="relative">
            <Brain className="w-24 h-24 text-accent-500 animate-spin-slow" />
          </div>
          <p className="text-white text-lg font-mono tracking-wider animate-pulse">Loading Intelligence...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
