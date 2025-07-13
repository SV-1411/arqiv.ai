import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AICustomizationPageProps {
  user: SupabaseUser | null;
}

export interface UserAISettings {
  understanding: 'Beginner' | 'Intermediate' | 'Expert';
  tone: 'Formal' | 'Friendly' | 'Humorous';
  length: 'Concise' | 'Detailed';
  language: 'English' | 'Spanish' | 'French';
  citations: 'Yes' | 'No';
  format: 'Bullet Points' | 'Paragraphs' | 'Mixed';
  additionalPrompt: string;
}

export const AICustomizationPage: React.FC<AICustomizationPageProps> = ({ user }) => {
  const defaultSettings: UserAISettings = {
    understanding: 'Intermediate',
    tone: 'Friendly',
    length: 'Detailed',
    language: 'English',
    citations: 'Yes',
    format: 'Mixed',
    additionalPrompt: ''
  };

  const storageKey = user ? `custom_settings_${user.id}` : 'custom_settings_guest';

  const [settings, setSettings] = useState<UserAISettings>(defaultSettings);
  const [savedMsg, setSavedMsg] = useState('');

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const handleChange = (field: keyof UserAISettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setSavedMsg('Saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto text-center mt-24 text-parchment-200">
        <Helmet>
          <title>Login Required • Arqiv.ai</title>
        </Helmet>
        <p className="text-lg">⚠️ Please log in first to customize Arqiv.ai behaviour.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-24 px-4">
      <Helmet>
        <title>Customize AI • Arqiv.ai</title>
      </Helmet>

      <h1 className="text-3xl font-semibold mb-6 text-parchment-200">AI Customization</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Understanding Level */}
        <div>
          <label className="block mb-1 text-parchment-200 font-medium">Understanding Level</label>
          <select
            value={settings.understanding}
            onChange={(e) => handleChange('understanding', e.target.value as UserAISettings['understanding'])}
            className="w-full p-3 rounded-lg bg-surface-200 border border-surface-400 text-parchment-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Expert</option>
          </select>
        </div>

        {/* Tone */}
        <div>
          <label className="block mb-1 text-parchment-200 font-medium">AI Tone</label>
          <select
            value={settings.tone}
            onChange={(e) => handleChange('tone', e.target.value as UserAISettings['tone'])}
            className="w-full p-3 rounded-lg bg-surface-200 border border-surface-400 text-parchment-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option>Formal</option>
            <option>Friendly</option>
            <option>Humorous</option>
          </select>
        </div>

        {/* Answer Length */}
        <div>
          <label className="block mb-1 text-parchment-200 font-medium">Answer Length</label>
          <select
            value={settings.length}
            onChange={(e) => handleChange('length', e.target.value as UserAISettings['length'])}
            className="w-full p-3 rounded-lg bg-surface-200 border border-surface-400 text-parchment-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option>Concise</option>
            <option>Detailed</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block mb-1 text-parchment-200 font-medium">Language</label>
          <select
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value as UserAISettings['language'])}
            className="w-full p-3 rounded-lg bg-surface-200 border border-surface-400 text-parchment-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>

        {/* Citations */}
        <div>
          <label className="block mb-1 text-parchment-200 font-medium">Include Citations</label>
          <select
            value={settings.citations}
            onChange={(e) => handleChange('citations', e.target.value as UserAISettings['citations'])}
            className="w-full p-3 rounded-lg bg-surface-200 border border-surface-400 text-parchment-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        {/* Format */}
        <div>
          <label className="block mb-1 text-parchment-200 font-medium">Preferred Format</label>
          <select
            value={settings.format}
            onChange={(e) => handleChange('format', e.target.value as UserAISettings['format'])}
            className="w-full p-3 rounded-lg bg-surface-200 border border-surface-400 text-parchment-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option>Bullet Points</option>
            <option>Paragraphs</option>
            <option>Mixed</option>
          </select>
        </div>

        {/* Additional Prompt */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-parchment-200 font-medium">Additional Instructions</label>
          <textarea
            value={settings.additionalPrompt}
            onChange={(e) => handleChange('additionalPrompt', e.target.value)}
            className="w-full h-40 p-3 rounded-lg bg-surface-200 border border-surface-400 text-parchment-200 resize-none focus:outline-none focus:ring-2 focus:ring-accent-500"
            placeholder="Add any extra guidance you’d like the AI to follow..."
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 px-6 py-3 bg-accent-500 hover:bg-accent-600 rounded-lg text-white font-semibold shadow-lg"
      >
        Save Settings
      </button>

      {savedMsg && <p className="mt-2 text-accent-500 font-semibold">{savedMsg}</p>}
    </div>
  );
};
