import React, { useState, useEffect } from 'react';

const loadingTexts = [
  'Waking up the AI...',
  'Brewing digital coffee...',
  'Untangling neural nets...',
  'Reticulating splines...',
  'Consulting the silicon gods...',
  'Polishing the pixels...',
  'Assembling brilliance...',
];

export const AiLoadingScreen: React.FC = () => {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center text-white font-mono">
      <div className="relative w-40 h-40 md:w-48 md:h-48">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-75 animate-pulse"></div>
        <div className="absolute inset-2 rounded-full bg-black"></div>
        <div className="absolute inset-4 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 animate-spin-slow"></div>
        </div>
      </div>
      <p className="mt-8 text-lg md:text-xl tracking-widest animate-pulse text-gray-300">{loadingTexts[textIndex]}</p>
    </div>
  );
};
