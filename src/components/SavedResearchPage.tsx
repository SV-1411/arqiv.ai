import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SavedResearchItem } from './SavedResearchItem';
import { SavedItem, SavedResearchPageProps } from '../types';

export const SavedResearchPage: React.FC<SavedResearchPageProps> = ({ user, onSuggestionClick }) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSavedItems();
    } else {
      setIsLoading(false);
      setSavedItems([]);
    }
  }, [user]);

  const fetchSavedItems = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('saved_research')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved items:', error.message);
      setSavedItems([]);
    } else if (data) {
      const items: SavedItem[] = data.map((row: any) => ({
        id: row.id,
        input: row.topic,
        result: row.response,
        mode: row.mode,
        depth: row.depth,
        wikiImage: row.wiki_image || '',
        images: Array.isArray(row.images) ? row.images : [],
        suggestions: Array.isArray(row.suggestions) ? row.suggestions : [],
        timestamp: new Date(row.created_at).getTime()
      }));
      setSavedItems(items);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('saved_research')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
    } else {
      setSavedItems(savedItems.filter(item => item.id !== id));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick(suggestion);
    navigate('/');
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-gray-400">Loading saved research...</p>;
    }

    if (!user) {
      return (
        <div className="text-center p-8 bg-surface-100 rounded-lg">
          <p className="text-gray-300 text-lg">Please sign in to view your saved research.</p>
        </div>
      );
    }

    if (savedItems.length === 0) {
      return (
        <div className="text-center p-8 bg-surface-100 rounded-lg">
          <p className="text-gray-300 text-lg">You have no saved research yet.</p>
          <p className="text-gray-400 mt-2">Go back to the <a href="/" className="text-accent-500 hover:underline">homepage</a> to start your first research.</p>
        </div>
      );
    }

    return savedItems.map(item => (
      <SavedResearchItem 
        key={item.id}
        item={item}
        onDelete={handleDelete}
        onSuggestionClick={handleSuggestionClick}
      />
    ));
  };

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Saved Research - arqivAi</title>
      </Helmet>
      <h2 className="text-3xl font-bold text-white">Saved Research</h2>
      {renderContent()}
    </div>
  );
};
