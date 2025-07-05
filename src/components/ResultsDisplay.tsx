import React from 'react';
import { FileText, Image, Clock, Globe, BookOpen, Bookmark, RefreshCw, ImageIcon, Search, Sparkles, Cloud, CloudOff } from 'lucide-react';
import { ImageResult } from '../App';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ResultsDisplayProps {
  result: string;
  isLoading: boolean;
  isRegenerating: boolean;
  mode: string;
  depth: string;
  wikiImage: string;
  images: ImageResult[];
  input: string;
  suggestions: string[];
  isLoadingSuggestions: boolean;
  onSave: () => void;
  onRegenerate: () => void;
  onSuggestionClick: (suggestion: string) => void;
  user: SupabaseUser | null;
  isSaving: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  isLoading,
  isRegenerating,
  mode,
  depth,
  wikiImage,
  images,
  input,
  suggestions,
  isLoadingSuggestions,
  onSave,
  onRegenerate,
  onSuggestionClick,
  user,
  isSaving
}) => {
  const getDepthIcon = (depth: string) => {
    switch (depth) {
      case 'Quick Idea': return <Clock className="w-5 h-5 text-green-400" />;
      case 'Detailed Research': return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'Investigator Mode': return <Globe className="w-5 h-5 text-purple-400" />;
      case 'Everything': return <FileText className="w-5 h-5 text-orange-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getModeEmoji = (mode: string) => {
    switch (mode) {
      case 'Person': return '👤';
      case 'Event': return '📅';
      case 'Year': return '🗓️';
      case 'Concept': return '💡';
      case 'Location': return '🌍';
      default: return '🔍';
    }
  };

  // Stable icon rendering to prevent DOM manipulation errors
  const renderSaveIcon = () => {
    if (isSaving) {
      return (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    
    // Use consistent icon regardless of user state to prevent DOM errors
    return <Bookmark className="w-5 h-5 mr-2" />;
  };

  const getSaveButtonText = () => {
    if (isSaving) return 'Saving...';
    if (user) return 'Save to Cloud';
    return 'Sign In to Save';
  };

  const getSaveButtonTitle = () => {
    if (user) return 'Save to your cloud collection';
    return 'Sign in to save to cloud';
  };

  if (!result && !isLoading) return null;

  return (
    <div className="space-y-6">
      <div 
        id="result" 
        className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-gray-600 rounded-3xl p-8 shadow-2xl transition-all duration-500 ease-in-out backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start">
            <div className="bg-[#00bfff] bg-opacity-20 p-3 rounded-xl mr-4">
              <FileText className="w-6 h-6 text-[#00bfff]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Research Results</h3>
              <p className="text-gray-400">Topic: <span className="text-white font-medium">{input}</span></p>
            </div>
          </div>
        </div>

        {/* Research Parameters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center bg-[#333333] px-4 py-2 rounded-full">
            <span className="mr-2 text-lg">{getModeEmoji(mode)}</span>
            <span className="text-gray-300 text-sm font-medium">{mode}</span>
          </div>
          <div className="flex items-center bg-[#333333] px-4 py-2 rounded-full">
            {getDepthIcon(depth)}
            <span className="text-gray-300 text-sm font-medium ml-2">{depth}</span>
          </div>
          <div className="flex items-center bg-[#333333] px-4 py-2 rounded-full">
            <Globe className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-gray-300 text-sm font-medium">OSINT Research</span>
          </div>
          {isRegenerating && (
            <div className="flex items-center bg-purple-500 bg-opacity-20 px-4 py-2 rounded-full">
              <RefreshCw className="w-4 h-4 text-purple-400 mr-2 animate-spin" />
              <span className="text-purple-300 text-sm font-medium">Regenerating...</span>
            </div>
          )}
        </div>

        {/* Research-Grade Image Gallery */}
        {images.length > 0 && !isLoading && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <ImageIcon className="w-5 h-5 text-[#00bfff] mr-2" />
              <h4 className="text-lg font-semibold text-white">Research Sources & Visual References</h4>
            </div>
            
            <div className={`grid gap-4 ${
              images.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
              images.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              images.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}>
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="relative overflow-hidden rounded-xl border border-gray-600 shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <img 
                      src={image.url} 
                      alt={image.alt}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    
                    {/* Source Badge */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">{image.source}</span>
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                      <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-sm font-medium">{image.alt}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image Credit */}
                  <div className="mt-2 text-center">
                    <p className="text-gray-400 text-xs">{image.credit || `Image from ${image.source}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-700">
          <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
            {isLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-600 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-600 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-600 rounded w-5/6 mb-3"></div>
                  <div className="h-4 bg-gray-600 rounded w-4/5 mb-4"></div>
                  <div className="h-4 bg-gray-600 rounded w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                </div>
                <div className="flex items-center justify-center mt-6 text-[#00bfff]">
                  <Globe className="w-5 h-5 mr-2 animate-spin" />
                  <span className="text-sm font-medium">Gathering intelligence from multiple sources...</span>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                {result.split('\n').map((paragraph, index) => {
                  if (paragraph.trim() === '') return <br key={index} />;
                  
                  // Style headers
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <h4 key={index} className="text-xl font-bold text-[#00bfff] mt-6 mb-3 first:mt-0">
                        {paragraph.replace(/\*\*/g, '')}
                      </h4>
                    );
                  }
                  
                  // Style bullet points
                  if (paragraph.trim().startsWith('- ')) {
                    return (
                      <div key={index} className="flex items-start mb-2">
                        <div className="w-2 h-2 bg-[#00bfff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-gray-200" dangerouslySetInnerHTML={{ 
                          __html: paragraph.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') 
                        }} />
                      </div>
                    );
                  }
                  
                  return (
                    <p key={index} className="mb-4 text-gray-200" dangerouslySetInnerHTML={{ 
                      __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') 
                    }} />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Related Explorations Section */}
        {(suggestions.length > 0 || isLoadingSuggestions) && result && !isLoading && (
          <div className="mt-12">
            <div className="flex items-center justify-center mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
              <div className="flex items-center px-6">
                <Search className="w-5 h-5 text-[#00bfff] mr-2" />
                <h3 className="text-xl font-bold text-white">🔎 Related Explorations You Might Like</h3>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {isLoadingSuggestions ? (
                // Loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse bg-gray-600 rounded-full px-6 py-3 h-12 w-48"
                  ></div>
                ))
              ) : (
                // Actual suggestions
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="group relative bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] border border-gray-600 rounded-full px-6 py-3 text-white font-medium hover:from-[#00bfff] hover:to-purple-500 hover:border-transparent transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-gray-400 group-hover:text-white transition-colors duration-300" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00bfff] to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
                  </button>
                ))
              )}
            </div>

            <div className="text-center mt-4">
              <p className="text-gray-500 text-sm">
                Click any topic to explore • AI-generated curiosity suggestions
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {result && !isLoading && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate Answer'}
          </button>
          
          <button
            id="save-button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title={getSaveButtonTitle()}
          >
            {renderSaveIcon()}
            {getSaveButtonText()}
          </button>
        </div>
      )}
    </div>
  );
};