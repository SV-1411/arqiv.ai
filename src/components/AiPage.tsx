import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SearchForm } from './SearchForm';
import { ResultsDisplay } from './ResultsDisplay';
import { AiLoadingScreen } from './AiLoadingScreen';
import { Menu, X, Home, Sparkles, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBook } from './BookContext';
import '../hide-scroll.css';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { ImageResult } from '../types';
import { type ResearchSource } from '../lib/enhancedApiServices';

interface AiPageProps {
  backgroundClass?: string;
  trendingSuggestions: string[];
  isLoadingTrending: boolean;
  input: string;
  setInput: (input: string) => void;
  mode: string;
  setMode: (mode: string) => void;
  depth: string;
  setDepth: (depth: string) => void;
  isLoading: boolean;
  onSubmit: (input: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  result: string;
  isRegenerating: boolean;
  wikiImage: string;
  images: ImageResult[];
  suggestions: string[];
  isLoadingSuggestions: boolean;
  onRegenerate: () => void;
  onSuggestionClick: (suggestion: string) => void;
  user: SupabaseUser | null;
  enhancedSources: ResearchSource[];
  citations: string;
}

export const AiPage: React.FC<AiPageProps> = (props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { goToPage } = useBook();
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  const [backgroundVideo, setBackgroundVideo] = useState('/vid.mp4'); // Default video

  useEffect(() => {
    // Disable body scroll when AI page is mounted
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoader(false);
    }, 2500); // Show loader for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' as 'success' | 'error', show: false });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: '', type: 'success', show: false });
    }, 4000);
  };

  if (showInitialLoader) {
    return <AiLoadingScreen />;
  }

  const handleSaveResult = async () => {
    if (!props.input.trim() || !props.result.trim()) {
      showNotification('No research result to save.', 'error');
      return;
    }

    if (!props.user) {
      showNotification('Please sign in to save your research.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const { data: existingItems, error: checkError } = await supabase
        .from('saved_research')
        .select('id')
        .eq('user_id', props.user.id)
        .eq('topic', props.input.trim())
        .eq('mode', props.mode)
        .eq('depth', props.depth);

      if (checkError) throw checkError;

      if (existingItems && existingItems.length > 0) {
        showNotification('This research query is already saved.', 'error');
        setIsSaving(false);
        return;
      }

      const saveData = {
        user_id: props.user.id,
        topic: props.input.trim(),
        response: props.result.trim(),
        mode: props.mode,
        depth: props.depth,
        wiki_image: props.wikiImage,
        images: props.images,
        suggestions: props.suggestions,
      };

      const { error } = await supabase.from('saved_research').insert([saveData]);

      if (error) throw error;

      showNotification('Research saved successfully!', 'success');
    } catch (error: any) {
      console.error('Error saving research:', error);
      showNotification(`Error saving research: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="relative h-screen w-full text-white overflow-y-auto hide-scrollbar px-4 md:px-8 py-6 md:py-10">
      <div className="fixed inset-0 bg-black z-[-4]"></div>
      {/* Static wallpaper image */}
      <img
        src="/brown.jpg"
        alt="brown texture background"
        className="fixed inset-0 w-full h-full object-cover z-[-3] opacity-80 brightness-25"
      />
      {/* Hamburger */}
      <button className="fixed top-18 left-80 md:left-40 z-40 text-accent-500 hover:text-accent-600 p-2 rounded-md bg-white/10 backdrop-blur-sm" onClick={() => setIsSidebarOpen(true)}>
        <Menu className="w-8 h-8" />
      </button>

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-[#0f0f0f] via-[#1a1a1a] to-[#0b0b0b] backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 border-r-4 border-accent-500/60 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-3xl font-extrabold tracking-wide text-accent-500">Menu</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-200">
            <X className="w-7 h-7" />
          </button>
        </div>
        <div className="flex flex-col px-6 py-8 space-y-6">
          <button onClick={() => {goToPage(0); navigate('/'); setIsSidebarOpen(false);}} className="group flex items-center space-x-4 px-5 py-4 rounded-xl bg-white/5 hover:bg-accent-500/30 transition-all duration-300 transform hover:translate-x-2 hover:scale-105 hover:shadow-xl text-accent-400 hover:text-white border border-transparent hover:border-accent-500/50">
            <Home className="w-6 h-6 group-hover:animate-pulse" />
            <span className="text-lg font-semibold">Home</span>
          </button>
          <button onClick={() => {goToPage(1); navigate('/about'); setIsSidebarOpen(false);}} className="group flex items-center space-x-4 px-5 py-4 rounded-xl bg-white/5 hover:bg-accent-500/30 transition-all duration-300 transform hover:translate-x-2 hover:scale-105 hover:shadow-xl text-accent-400 hover:text-white border border-transparent hover:border-accent-500/50">
            <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
            <span className="text-lg font-semibold">About Us</span>
          </button>
          <button onClick={() => {goToPage(2); navigate('/ai'); setIsSidebarOpen(false);}} className="group flex items-center space-x-4 px-5 py-4 rounded-xl bg-white/5 hover:bg-accent-500/30 transition-all duration-300 transform hover:translate-x-2 hover:scale-105 hover:shadow-xl text-accent-400 hover:text-white border border-transparent hover:border-accent-500/50">
            <Brain className="w-6 h-6 group-hover:animate-pulse" />
            <span className="text-lg font-semibold">AI</span>
          </button>
        </div>
      </div>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)} />}

      {/* Video wallpaper */}
      <div className="fixed inset-0 bg-black/70 z-[-1] pointer-events-none"></div>
      <video
        key={backgroundVideo}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[-2] opacity-15 transition-opacity duration-1000"
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Scrollable content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen pb-20 pt-28 w-full max-w-5xl mx-auto">
      {notification.show && (
        <div 
          className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 transition-opacity duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {notification.message}
        </div>
      )}
      <Helmet>
        <title>arqivAi - AI-Powered Research Assistant</title>
        <meta name="description" content="Unlock deeper insights with arqivAi, an AI-powered research assistant that synthesizes information from multiple sources to give you comprehensive answers. Start your intelligent search today." />
      </Helmet>
      {/* Action buttons aligned to the far right */}
      <div className="flex gap-4 absolute top-6 right-1 z-40">
        {props.user ? (
          <>
            <Link to="/saved" className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brown-500 via-pink-300 to-brown-500 text-white font-semibold shadow-lg hover:to-yellow-400 transition-all">Saved Research</Link>
            <Link to="/customize" className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brown-500 via-amber-500 to-brown-500 text-white font-semibold shadow-lg hover:to-yellow-400 transition-all">Customize AI</Link>
          </>
        ) : (
          <Link to="/" className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brown-500 via-pink-300 to-brown-500 text-white font-semibold shadow-lg hover:to-yellow-400 transition-all">Login / Sign&nbsp;Up</Link>
        )}
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 font-mono text-white">
          Unlock the Power of Informed <span className="whitespace-nowrap">Decision-Making</span>
        </h1>
        <p className="text-lg text-white max-w-2xl mx-auto">Say goodbye to information overload and hello to actionable insights. arqivAi's AI-powered research tool helps you make informed decisions faster, saving you time and effort.</p>
      </div>

      <SearchForm
        input={props.input}
        setInput={props.setInput}
        mode={props.mode}
        setMode={props.setMode}
        depth={props.depth}
        setDepth={props.setDepth}
        isLoading={props.isLoading}
        onSubmit={() => props.onSubmit(props.input)}
        onKeyPress={props.onKeyPress}
      />
      
      {(props.trendingSuggestions.length > 0 || props.isLoadingTrending) && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {props.isLoadingTrending ? (
            Array.from({ length: 5 }).map((_, idx) => <div key={idx} className="animate-pulse bg-gray-600 rounded-full px-6 py-3 h-10 w-40"></div>)
          ) : (
            props.trendingSuggestions.slice(0, 4).map((s, idx) => (
              <button key={idx} onClick={() => props.onSuggestionClick(s)} className="bg-surface-200 hover:bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md text-center flex-grow sm:flex-grow-0">
                {s}
              </button>
            ))

          )}
        </div>
      )}

      <div className="mt-12">
        <ResultsDisplay
          result={props.result}
          isLoading={props.isLoading}
          isRegenerating={props.isRegenerating}
          mode={props.mode}
          depth={props.depth}
          wikiImage={props.wikiImage}
          images={props.images}
          input={props.input}
          suggestions={props.suggestions}
          isLoadingSuggestions={props.isLoadingSuggestions}
          onSave={handleSaveResult}
          onRegenerate={props.onRegenerate}
          onSuggestionClick={props.onSuggestionClick}
          user={props.user}
          isSaving={isSaving}
          enhancedSources={props.enhancedSources}
          citations={props.citations}
        />
      </div>
      </div>
    </div>
  );
};
