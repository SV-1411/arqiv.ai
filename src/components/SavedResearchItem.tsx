import React, { useState } from 'react';
import { SavedItem } from '../types';
import ReactMarkdown from 'react-markdown';

interface SavedResearchItemProps {
  item: SavedItem;
  onDelete: (id: string) => void;
  onSuggestionClick: (suggestion: string) => void;
}

export const SavedResearchItem: React.FC<SavedResearchItemProps> = ({ item, onDelete, onSuggestionClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const truncatedResult = item.result.length > 300 ? item.result.substring(0, 300) + '...' : item.result;

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg relative">
      <button 
        onClick={() => onDelete(item.id)}
        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors text-2xl font-bold"
      >
        &times;
      </button>
      <h3 className="text-2xl font-bold text-white mb-4">{item.input}</h3>
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{isExpanded ? item.result : truncatedResult}</ReactMarkdown>
      </div>
      {item.result.length > 300 && (
        <button 
          onClick={toggleExpanded}
          className="text-blue-400 hover:text-blue-300 transition-colors mt-4"
        >
          {isExpanded ? 'View Less' : 'View More'}
        </button>
      )}
      {item.suggestions && item.suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="font-bold text-lg mb-2">Related Suggestions:</h4>
          <div className="flex flex-wrap gap-2">
            {item.suggestions.map((suggestion, index) => (
              <button 
                key={index} 
                onClick={() => onSuggestionClick(suggestion)}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-3 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
