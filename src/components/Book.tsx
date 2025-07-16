import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { useBook } from './BookContext';

interface BookProps {
  pages: React.ReactNode[];
}

export const Book: React.FC<BookProps> = ({ pages }) => {
  const { bookRef, currentPage, setCurrentPage } = useBook();
  const location = useLocation();

  // When the route changes, update the flipbook's page
  useEffect(() => {
    const pageIndex = location.pathname === '/about' ? 1 : 0;
    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
    }
  }, [location.pathname, currentPage, setCurrentPage]);
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <HTMLFlipBook
      // @ts-ignore: react-pageflip has imperfect typings
      ref={bookRef}
      width={dimensions.w}
      height={dimensions.h}
      size="stretch"
      minWidth={dimensions.w}
      maxWidth={dimensions.w}
      usePortrait={true}
      drawShadow={false}
      flippingTime={800}
      mobileScrollSupport={true}
      onFlip={(e) => setCurrentPage(e.data)}
      startPage={currentPage}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      className="w-screen h-screen"
    >
      {pages.map((Page, idx) => (
        <div key={idx} className="w-full h-full overflow-y-auto">
          {Page}
        </div>
      ))}
    </HTMLFlipBook>
  );
};
