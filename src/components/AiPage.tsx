import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SearchForm } from './SearchForm';
import { ResultsDisplay } from './ResultsDisplay';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { ImageResult } from '../types';

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
}

export const AiPage: React.FC<AiPageProps> = (props) => {
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' as 'success' | 'error', show: false });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: '', type: 'success', show: false });
    }, 4000);
  };

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
    <div className={`min-h-screen w-full ${props.backgroundClass ?? 'bg-[#0a0a0a]'} text-white relative pb-20`}>
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
      <div className="flex justify-end gap-4 mb-6 sticky top-4 z-40">
        {props.user ? (
          <div className="flex justify-end gap-4 mb-6">
            <Link to="/saved" className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-accent-500 to-pink-500 text-white font-semibold shadow-lg hover:to-yellow-400 transition-all">Saved Research</Link>
            <Link to="/customize" className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-accent-500 text-white font-semibold shadow-lg hover:to-yellow-400 transition-all">Customize AI</Link>
          </div>
        ) : (
          <Link to="/" className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-accent-500 to-pink-500 text-white font-semibold shadow-lg hover:to-yellow-400 transition-all">Login / Sign&nbsp;Up</Link>
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
        />
      </div>
    </div>
  );
};
