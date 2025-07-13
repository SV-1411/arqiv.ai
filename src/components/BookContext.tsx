import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';

// Define the shape of the context
export interface BookContextType {
  goToPage: (index: number) => void;
  currentPage: number;
  bookRef: React.RefObject<any>;
  setCurrentPage: (page: number) => void;
}

// Create the context with an initial undefined value
export const BookContext = createContext<BookContextType | undefined>(undefined);

// Create the provider component
export const BookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const goToPage = (index: number) => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flip(index);
    }
  };

  const value = { goToPage, currentPage, bookRef, setCurrentPage };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};

// Custom hook to use the book context
export const useBook = () => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
};
