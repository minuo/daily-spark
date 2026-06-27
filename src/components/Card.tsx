import React from 'react';
import { Heart, RefreshCw, Share2, PenLine } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  onRefresh?: () => void;
  onShare?: () => void;
  onWriteNote?: () => void;
  hasNote?: boolean;
  isLoading?: boolean;
  isMinimal?: boolean;
  children: React.ReactNode;
}

const contentVariants = {
  active: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  refreshing: {
    rotateY: 90,
    opacity: 0,
    scale: 0.95,
    filter: 'blur(4px)',
  },
};

export const Card: React.FC<CardProps> = ({
  title,
  icon,
  onRefresh,
  onShare,
  onWriteNote,
  hasNote,
  isLoading,
  isMinimal,
  children,
}) => {
  return (
    <div className={`bg-theme-card rounded-2xl shadow-[var(--card-shadow)] border border-theme-border transition-all duration-300 hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-1 relative group h-full flex flex-col ${isMinimal ? 'p-4' : 'p-6'} overflow-hidden`}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-theme-card/75 backdrop-blur-[2px] rounded-2xl"
          >
            <RefreshCw className="animate-spin text-theme-accent" size={24} />
          </motion.div>
        )}
      </AnimatePresence>
      {!isMinimal && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 font-medium text-theme-primary">
            <span className="text-theme-accent">{icon}</span>
            <span className="text-sm tracking-widest uppercase font-sans font-medium text-theme-secondary">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            {onWriteNote && (
              <button
                onClick={onWriteNote}
                className={`p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100 ${
                  hasNote ? 'text-amber-500 bg-amber-500/10' : 'text-theme-muted hover:text-amber-500 hover:bg-theme-sec'
                }`}
                aria-label="Write a note"
              >
                <PenLine size={16} />
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="p-2 rounded-full text-theme-muted hover:text-theme-accent hover:bg-theme-sec transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                aria-label="Share content image"
              >
                <Share2 size={16} />
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 rounded-full text-theme-muted hover:text-theme-accent hover:bg-theme-sec transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                aria-label="Refresh content"
                disabled={isLoading}
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>
      )}
      {isMinimal && (
        <div className="absolute top-3 right-3 flex items-center gap-0.5 z-10 transition-colors">
          {onWriteNote && (
            <button
              onClick={onWriteNote}
              className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 sm:opacity-100 ${
                hasNote ? 'text-amber-500 bg-amber-500/10' : 'text-theme-muted hover:text-amber-500 hover:bg-theme-sec'
              }`}
              aria-label="Write a note"
            >
              <PenLine size={12} />
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="p-1.5 rounded-full text-theme-muted hover:text-theme-accent hover:bg-theme-sec opacity-0 group-hover:opacity-100 sm:opacity-100"
              aria-label="Share content image"
            >
              <Share2 size={12} />
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-full text-theme-muted hover:text-theme-accent hover:bg-theme-sec opacity-0 group-hover:opacity-100 sm:opacity-100"
              aria-label="Refresh content"
              disabled={isLoading}
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      )}
      <div className="text-theme-primary leading-relaxed flex-1 flex flex-col relative overflow-hidden" style={{ perspective: 1000 }}>
        <motion.div
          variants={contentVariants}
          animate={isLoading ? 'refreshing' : 'active'}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col w-full h-full"
        >
          {isMinimal && (
            <span className="text-xs text-theme-accent font-medium mb-2 uppercase tracking-widest">{title}</span>
          )}
          {children}
        </motion.div>
      </div>
    </div>
  );
};
