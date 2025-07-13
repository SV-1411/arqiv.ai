import { useEffect, useState } from 'react';

export const InitialLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Controls when to hide the splash. It stays for at least 1 second so the user always sees it.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 3000); // 1 s minimum splash
    return () => clearTimeout(timer);
  }, []);

  // side effect to show background video after splash
  useEffect(() => {
    if (ready) {
      const vid = document.querySelector<HTMLVideoElement>('video.bg-video');
      if (vid) {
        vid.style.visibility = 'visible';
        vid.classList.remove('opacity-0');
        vid.playbackRate = 0.75; // Slow down the video for a more ambient feel
      }
    }
  }, [ready]);

  return (
    <>
      {!ready && (
        <div className="fixed inset-0 z-50 bg-[#3b2a1a] flex flex-col items-center justify-center text-white font-mono text-3xl tracking-wider">
          arqiv.ai
          <div className="mt-6 w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className={ready ? '' : 'invisible'}>{children}</div>
    </>
  );
};