import React, { useState, useEffect } from 'react';

interface BookCoverProps {
  coverUrl?: string;
  coverEmoji: string;
  title?: string;
  size: 'small' | 'large';
}

export const BookCover: React.FC<BookCoverProps> = ({ coverUrl, coverEmoji, title = '书本', size }) => {
  const [hasError, setHasError] = useState(false);

  // Automatically map Douban cover URLs and raw filenames to the local /covers/ directory
  const getResolvedCoverUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('/covers/') || url.startsWith('covers/')) {
      return url.startsWith('/') ? url : `/${url}`;
    }
    // If it is a Douban image URL, map to the local covers directory
    if (url.includes('doubanio.com')) {
      const filename = url.substring(url.lastIndexOf('/') + 1);
      if (filename && filename.endsWith('.jpg')) {
        return `/covers/${filename}`;
      }
    }
    // If it's a raw filename that starts with 's' and ends with '.jpg'
    const filenameMatch = url.match(/^(s\d+\.jpg)$/);
    if (filenameMatch) {
      return `/covers/${filenameMatch[1]}`;
    }
    return url;
  };

  const resolvedUrl = getResolvedCoverUrl(coverUrl);

  // Reset error state when the cover URL changes (e.g., on manual book refresh)
  useEffect(() => {
    setHasError(false);
  }, [coverUrl]);

  if (resolvedUrl && !hasError) {
    if (size === 'small') {
      return (
        <img
          src={resolvedUrl}
          alt={title}
          className="w-12 h-12 object-cover rounded-lg shrink-0 shadow-sm transition-all duration-300 hover:scale-105"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      );
    } else {
      return (
        <img
          src={resolvedUrl}
          alt={title}
          className="w-24 h-32 object-cover rounded-xl shrink-0 shadow-md transition-all duration-300 hover:scale-105"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      );
    }
  }

  // Fallback: Custom styled cover using Emoji + styled slate card
  if (size === 'small') {
    return (
      <div 
        className="w-12 h-12 flex items-center justify-center text-2xl bg-theme-sec border border-theme-border rounded-xl shrink-0 shadow-sm animate-fade-in select-none"
        title={`${title} (使用内置标签封面)`}
      >
        {coverEmoji}
      </div>
    );
  }

  return (
    <div 
      className="w-24 h-32 flex flex-col items-center justify-center text-5xl bg-theme-sec border border-theme-border rounded-2xl shrink-0 shadow-inner relative overflow-hidden select-none animate-fade-in"
      title={`${title} (使用内置标签封面)`}
    >
      {/* Decorative vertical spine lines mimicking pages */}
      <div className="absolute left-1 top-0 bottom-0 w-1.5 bg-theme-muted/15 border-r border-theme-border/10" />
      <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-theme-muted/5" />
      
      {/* Core Emoji */}
      <span className="transform transition-transform duration-300 group-hover:scale-110 z-10">{coverEmoji}</span>
    </div>
  );
};
