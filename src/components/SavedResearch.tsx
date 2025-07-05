import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Calendar, Tag, Layers, BookOpen, ImageIcon, Search, Sparkles, Cloud, HardDrive, User } from 'lucide-react';
import { SavedItem, ImageResult } from '../App';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface SavedResearchProps {
  savedItems: SavedItem[];
  onDelete: (id: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  user: SupabaseUser | null;
  isLoading: boolean;
}

export const SavedResearch: React.FC<SavedResearchProps> = ({ 
  savedItems, 
  onDelete, 
  onSuggestionClick, 
  user, 
  isLoading 
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPreview = (result: string) => {
    // Extract the summary section (first few lines after 📌 **Summary**)
    const summaryMatch = result.match(/📌\s*\*\*Summary\*\*\s*\n(.*?)(?=\n\n|\n📂)/s);
    if (summaryMatch) {
      return summaryMatch[1].trim().substring(0, 150) + '...';
    }
    
    // Fallback to first 150 characters
    return result.substring(0, 150) + '...';
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

  const getDepthColor = (depth: string) => {
    switch (depth) {
      case 'Quick Idea': return 'text-green-400';
      case 'Detailed Research': return 'text-blue-400';
      case 'Investigator Mode': return 'text-purple-400';
      case 'Everything': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="mt-16">
        <div className="flex items-center justify-center mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
          <div className="flex items-center px-6">
            <BookOpen className="w-6 h-6 text-[#00bfff] mr-3" />
            <h2 className="text-2xl font-bold text-white">📚 Saved Research</h2>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-gray-600 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-600 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-3 mb-4">
                <div className="h-6 bg-gray-600 rounded-full w-20"></div>
                <div className="h-6 bg-gray-600 rounded-full w-24"></div>
                <div className="h-6 bg-gray-600 rounded-full w-28"></div>
              </div>
              <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (savedItems.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="flex items-center justify-center mb-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
        <div className="flex items-center px-6">
          <BookOpen className="w-6 h-6 text-[#00bfff] mr-3" />
          <h2 className="text-2xl font-bold text-white">📚 Saved Research</h2>
          {user && (
            <div className="ml-3 flex items-center bg-[#00bfff] bg-opacity-20 px-3 py-1 rounded-full">
              <Cloud className="w-4 h-4 text-[#00bfff] mr-1" />
              <span className="text-[#00bfff] text-sm font-medium">Cloud Sync</span>
            </div>
          )}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
      </div>

      <div className="space-y-4">
        {savedItems.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          const hasImages = item.images && item.images.length > 0;
          const hasSuggestions = item.suggestions && item.suggestions.length > 0;
          
          return (
            <div
              key={item.id}
              className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-gray-600 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                      <span className="mr-3 text-2xl">{getModeEmoji(item.mode)}</span>
                      {item.input}
                    </h3>
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center bg-[#333333] px-3 py-1 rounded-full">
                        <Tag className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-300 text-sm">{item.mode}</span>
                      </div>
                      <div className="flex items-center bg-[#333333] px-3 py-1 rounded-full">
                        <Layers className={`w-4 h-4 mr-2 ${getDepthColor(item.depth)}`} />
                        <span className="text-gray-300 text-sm">{item.depth}</span>
                      </div>
                      <div className="flex items-center bg-[#333333] px-3 py-1 rounded-full">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-300 text-sm">{formatDate(item.timestamp)}</span>
                      </div>
                      {hasImages && (
                        <div className="flex items-center bg-[#333333] px-3 py-1 rounded-full">
                          <ImageIcon className="w-4 h-4 text-blue-400 mr-2" />
                          <span className="text-gray-300 text-sm">{item.images.length} image{item.images.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {hasSuggestions && (
                        <div className="flex items-center bg-[#333333] px-3 py-1 rounded-full">
                          <Search className="w-4 h-4 text-purple-400 mr-2" />
                          <span className="text-gray-300 text-sm">{item.suggestions.length} suggestions</span>
                        </div>
                      )}
                      {/* Storage indicator */}
                      <div className="flex items-center bg-[#333333] px-3 py-1 rounded-full">
                        {user ? (
                          <>
                            <Cloud className="w-4 h-4 text-[#00bfff] mr-2" />
                            <span className="text-gray-300 text-sm">Cloud</span>
                          </>
                        ) : (
                          <>
                            <HardDrive className="w-4 h-4 text-orange-400 mr-2" />
                            <span className="text-gray-300 text-sm">Local</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Preview */}
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {getPreview(item.result)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="flex items-center px-4 py-2 bg-[#00bfff] bg-opacity-20 text-[#00bfff] rounded-lg hover:bg-opacity-30 transition-all duration-200"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          View Details
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
                      title="Delete saved research"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-600 bg-[#1a1a1a] p-6">
                  {/* Image Gallery */}
                  {hasImages && (
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <ImageIcon className="w-5 h-5 text-[#00bfff] mr-2" />
                        <h4 className="text-lg font-semibold text-white">Research Sources & Visual References</h4>
                      </div>
                      
                      <div className={`grid gap-3 ${
                        item.images.length === 1 ? 'grid-cols-1 max-w-sm' :
                        item.images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                        item.images.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                      }`}>
                        {item.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="relative overflow-hidden rounded-lg border border-gray-600 shadow-md">
                              <img 
                                src={image.url} 
                                alt={image.alt}
                                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              
                              {/* Source Badge */}
                              <div className="absolute top-1 right-1 bg-black bg-opacity-70 px-2 py-1 rounded">
                                <span className="text-white text-xs">{image.source}</span>
                              </div>
                            </div>
                            
                            {/* Image Credit */}
                            <p className="text-gray-400 text-xs mt-1 text-center">
                              {image.credit || `Image from ${image.source}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Full Result */}
                  <div className="prose prose-invert max-w-none mb-6">
                    <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {item.result.split('\n').map((paragraph, index) => {
                        if (paragraph.trim() === '') return <br key={index} />;
                        
                        // Style headers
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                          return (
                            <h4 key={index} className="text-lg font-bold text-[#00bfff] mt-6 mb-3 first:mt-0">
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
                  </div>

                  {/* Saved Suggestions */}
                  {hasSuggestions && (
                    <div className="border-t border-gray-700 pt-6">
                      <div className="flex items-center mb-4">
                        <Search className="w-5 h-5 text-[#00bfff] mr-2" />
                        <h4 className="text-lg font-semibold text-white">Related Explorations</h4>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => onSuggestionClick(suggestion)}
                            className="group relative bg-gradient-to-r from-[#333333] to-[#2a2a2a] border border-gray-600 rounded-full px-4 py-2 text-white text-sm font-medium hover:from-[#00bfff] hover:to-purple-500 hover:border-transparent transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                          >
                            <div className="flex items-center">
                              <Sparkles className="w-3 h-3 mr-2 text-gray-400 group-hover:text-white transition-colors duration-300" />
                              <span>{suggestion}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collection Stats */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center space-x-4 mb-2">
          <p className="text-gray-500 text-sm">
            {savedItems.length} research {savedItems.length === 1 ? 'item' : 'items'} saved in your collection
          </p>
          {user && (
            <div className="flex items-center text-[#00bfff] text-sm">
              <Cloud className="w-4 h-4 mr-1" />
              <span>Synced to cloud</span>
            </div>
          )}
        </div>
        {!user && savedItems.length > 0 && (
          <p className="text-orange-400 text-xs">
            💡 Sign in to sync your research across devices and never lose your data
          </p>
        )}
      </div>
    </div>
  );
};