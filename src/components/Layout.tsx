import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface LayoutProps {
  user: SupabaseUser | null;
  isAuthLoading: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ user, isAuthLoading }) => {
  const [backgroundVideo, setBackgroundVideo] = useState('/vid.mp4');

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 bg-black z-[-2]"></div>
      <video
        key={backgroundVideo}
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1] opacity-30 transition-opacity duration-1000"
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <Header user={user} isAuthLoading={isAuthLoading} />
      <main className="relative z-10 pt-20">
        <Outlet context={{ setBackgroundVideo }} />
      </main>
      <Footer />
    </div>
  );
};
