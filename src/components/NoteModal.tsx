import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';

export interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent?: string;
  itemTitle?: string;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSave, initialContent = '', itemTitle = '微光笔记' }) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-theme-bg rounded-2xl shadow-2xl border border-theme-border overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-theme-card">
          <h2 className="text-lg font-bold text-theme-primary">
            记录感悟
            {itemTitle && <span className="ml-2 pl-2 border-l border-theme-border text-sm font-normal text-theme-muted">{itemTitle}</span>}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-theme-secondary hover:bg-theme-sec transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <textarea
            autoFocus
            className="w-full h-48 bg-theme-sec text-theme-primary rounded-xl p-4 border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/50 resize-none font-serif text-lg leading-relaxed shadow-inner"
            placeholder="写下你的简短感悟..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="px-6 py-4 border-t border-theme-border bg-theme-card flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-theme-secondary hover:bg-theme-sec transition-colors font-medium text-sm"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-theme-accent text-white hover:opacity-90 active:scale-95 transition-all font-medium text-sm shadow-sm"
          >
            <Save size={16} />
            保存
          </button>
        </div>
      </motion.div>
    </div>
  );
};
