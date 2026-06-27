import React, { useState, useEffect } from 'react';
import { Sparkles, Quote, Feather, BookOpen, ScrollText, RefreshCw, X, LayoutGrid, LayoutList, NotebookPen, Target, Star, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchQuote, fetchPoem, fetchBook, fetchIdiom } from './api';
import { QuoteData, PoemData, BookData, IdiomData } from './data/fallback';
import { Card } from './components/Card';
import { useNotes } from './hooks/useNotes';
import { ShareModal, ShareData } from './components/ShareModal';
import { NoteModal } from './components/NoteModal';
import { FocusMode } from './components/FocusMode';
import { BookCover } from './components/BookCover';
import { auth } from './firebase';

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#F5A623" : "#E8E8E8"} stroke={filled ? "#F5A623" : "#E8E8E8"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarHalfIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" stroke="#F5A623" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="halfGrad" x1="0" x2="1" y1="0" y2="0">
        <stop offset="50%" stopColor="#F5A623"/>
        <stop offset="50%" stopColor="#E8E8E8"/>
      </linearGradient>
    </defs>
    <polygon fill="url(#halfGrad)" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating / 2);
  const halfStar = (rating / 2) - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return (
    <div className="flex items-center gap-[2px]">
      {Array.from({ length: fullStars }).map((_, i) => <StarIcon key={`full-${i}`} filled={true} />)}
      {halfStar && <StarHalfIcon />}
      {Array.from({ length: emptyStars }).map((_, i) => <StarIcon key={`empty-${i}`} filled={false} />)}
    </div>
  );
};

export default function App() {
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [loadingPoem, setLoadingPoem] = useState(true);
  const [loadingBook, setLoadingBook] = useState(true);
  const [loadingIdiom, setLoadingIdiom] = useState(true);

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [poem, setPoem] = useState<PoemData | null>(null);
  const [book, setBook] = useState<BookData | null>(null);
  const [idiom, setIdiom] = useState<IdiomData | null>(null);
  const [viewMode, setViewMode] = useState<'detailed' | 'minimal'>('detailed');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        handleManualLoadAll();
      }, 5 * 60 * 1000); // 5 minutes auto refresh
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>(() => {
    const saved = localStorage.getItem('glow-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'auto';
  });

  // Notes states
  const { notes, addOrUpdateNote, deleteNote, getNoteByItemId } = useNotes();
  const [showNotes, setShowNotes] = useState(false);
  const [noteTarget, setNoteTarget] = useState<{ type: any, item: any } | null>(null);

  // Focus mode
  const [showFocusMode, setShowFocusMode] = useState(false);

  // Sharing states
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Sync / Fallback indicator state
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'checking'>('checking');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setSyncStatus('synced');
      } else {
        // Wait briefly to see if anonymous login succeeded or fails
        const t = setTimeout(() => {
          if (!auth.currentUser) {
            setSyncStatus('local');
          }
        }, 3000);
        return () => clearTimeout(t);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleShare = (type: 'quote' | 'poem' | 'book' | 'idiom', item: any) => {
    if (!item) return;
    if (type === 'quote') {
      setShareData({
        type: 'quote',
        title: '语录',
        content: item.content,
        author: item.author,
        source: item.source,
      });
    } else if (type === 'poem') {
      setShareData({
        type: 'poem',
        title: '每日一诗',
        itemTitle: item.title,
        content: item.content,
        author: item.author,
        dynasty: item.dynasty,
      });
    } else if (type === 'book') {
      setShareData({
        type: 'book',
        title: '每日一书',
        itemTitle: item.title,
        content: item.description,
        author: item.author,
        coverEmoji: item.coverEmoji,
        coverUrl: item.coverUrl,
      });
    } else if (type === 'idiom') {
      setShareData({
        type: 'idiom',
        title: '每日成语',
        word: item.word,
        pinyin: item.pinyin,
        explanation: item.explanation,
        source: item.source,
      });
    }
    setIsShareOpen(true);
  };

  const [illuminance, setIlluminance] = useState<number | null>(null);

  useEffect(() => {
    let sensor: any = null;
    if ('AmbientLightSensor' in window) {
      try {
        sensor = new (window as any).AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          setIlluminance(sensor.illuminance);
        });
        sensor.addEventListener('error', (event: any) => {
          console.warn('AmbientLightSensor error:', event.error.name, event.error.message);
        });
        sensor.start();
      } catch (err) {
        console.warn('AmbientLightSensor not supported or permission denied');
      }
    }
    return () => {
      if (sensor) {
        sensor.stop();
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('glow-theme', theme);
    const htmlElement = document.documentElement;

    const applyTheme = () => {
      const classesToRemove: string[] = [];
      htmlElement.classList.forEach((cls) => {
        if (cls.startsWith('theme-')) {
          classesToRemove.push(cls);
        }
      });
      classesToRemove.forEach((cls) => htmlElement.classList.remove(cls));

      if (theme === 'auto') {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 8) {
          htmlElement.classList.add('theme-dawn');
        } else if (hour >= 8 && hour < 17) {
          htmlElement.classList.add('theme-day');
        } else if (hour >= 17 && hour < 20) {
          htmlElement.classList.add('theme-dusk');
        } else {
          htmlElement.classList.add('theme-night');
        }
      } else {
        htmlElement.classList.add(`theme-${theme}`);
      }

      // Fine-tune UI contrast based on ambient light intensity
      if (illuminance !== null && theme === 'auto') {
        if (illuminance > 1000) {
          // Strong light: increase contrast
          htmlElement.style.setProperty('--ui-contrast', '1.05');
          htmlElement.style.setProperty('--ui-brightness', '0.96');
        } else if (illuminance < 20) {
          // Dark environment: reduce brightness for reading comfort
          htmlElement.style.setProperty('--ui-contrast', '0.95');
          htmlElement.style.setProperty('--ui-brightness', '0.9');
        } else {
          // Normal light
          htmlElement.style.setProperty('--ui-contrast', '1');
          htmlElement.style.setProperty('--ui-brightness', '1');
        }
      } else {
        htmlElement.style.removeProperty('--ui-contrast');
        htmlElement.style.removeProperty('--ui-brightness');
      }
    };

    applyTheme();

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', listener);
      } else {
        mediaQuery.addListener(listener);
      }
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', listener);
        } else {
          mediaQuery.removeListener(listener);
        }
      };
    }
  }, [theme, illuminance]);

  const refreshQuote = async () => {
    setLoadingQuote(true);
    try { setQuote(await fetchQuote()); } catch (e) { console.error(e); } finally { setLoadingQuote(false); }
  };

  const refreshPoem = async () => {
    setLoadingPoem(true);
    try { setPoem(await fetchPoem()); } catch (e) { console.error(e); } finally { setLoadingPoem(false); }
  };

  const refreshBook = async () => {
    setLoadingBook(true);
    try { setBook(await fetchBook()); } catch (e) { console.error(e); } finally { setLoadingBook(false); }
  };

  const refreshIdiom = async () => {
    setLoadingIdiom(true);
    try { setIdiom(await fetchIdiom()); } catch (e) { console.error(e); } finally { setLoadingIdiom(false); }
  };

  const logRefreshActivity = () => {
    try {
      const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const stored = localStorage.getItem('activity_refresh_log');
      const data = stored ? JSON.parse(stored) : {};
      
      // Limit to 5 points per day from refreshing to avoid spamming the heatmap
      if (data[today] >= 5) return;
      
      data[today] = (data[today] || 0) + 1;
      
      // cleanup old keys if needed
      if (Object.keys(data).length > 100) {
         const keys = Object.keys(data).sort();
         if (keys.length > 50) {
            delete data[keys[0]];
         }
      }
      
      localStorage.setItem('activity_refresh_log', JSON.stringify(data));
      window.dispatchEvent(new Event('activityLogUpdated'));
    } catch (e) {}
  };

  const handleRefreshQuote = () => { logRefreshActivity(); refreshQuote(); };
  const handleRefreshPoem = () => { logRefreshActivity(); refreshPoem(); };
  const handleRefreshBook = () => { logRefreshActivity(); refreshBook(); };
  const handleRefreshIdiom = () => { logRefreshActivity(); refreshIdiom(); };

  const loadAll = () => {
    refreshQuote();
    refreshPoem();
    refreshBook();
    refreshIdiom();
  };

  const handleManualLoadAll = () => {
    logRefreshActivity();
    loadAll();
  };

  useEffect(() => {
    loadAll();
  }, []);

  const renderIdiom = (word: string, pinyin: string, isMinimalMode: boolean) => {
    const chars = Array.from(word);
    const pinyinParts = pinyin.split(/\s+/);
    
    if (chars.length === pinyinParts.length) {
      return (
        <div className={`flex flex-wrap gap-x-2.5 sm:gap-x-3.5 gap-y-1.5 ${isMinimalMode ? 'justify-start mb-0.5' : 'justify-start mb-2'}`}>
          {chars.map((char, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className={`font-mono text-theme-accent font-medium select-none text-[11px] sm:text-xs leading-none pb-1 sm:pb-1.5`}>
                {pinyinParts[index]}
              </span>
              <span className={`font-serif font-bold text-theme-primary select-all leading-none ${isMinimalMode ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}`}>
                {char}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <span className={`font-serif font-bold text-theme-primary leading-tight ${isMinimalMode ? 'text-lg' : 'text-2xl sm:text-3xl'}`}>{word}</span>
        <span className="font-mono text-xs text-theme-accent tracking-wider">{pinyin}</span>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className={`${viewMode === 'detailed' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-4 max-w-2xl mx-auto'}`}>
        <AnimatePresence mode="popLayout">
          {quote && (
            <motion.div
              layout
              key={quote.id + viewMode}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={viewMode === 'detailed' ? "md:col-span-2" : ""}
            >
              <Card
                title="语录"
                icon={<Quote size={18} />}
                onRefresh={handleRefreshQuote}
                onShare={() => handleShare('quote', quote)}
                onWriteNote={() => setNoteTarget({ type: 'quote', item: quote })}
                hasNote={!!getNoteByItemId(quote.id)}
                isLoading={loadingQuote}
                isMinimal={viewMode === 'minimal'}
              >
                <div className={`flex flex-col h-full justify-center ${viewMode === 'minimal' ? 'py-2' : 'py-4'}`}>
                  <blockquote className={`font-serif text-theme-primary leading-relaxed ${viewMode === 'minimal' ? 'text-lg mb-2' : 'text-xl md:text-2xl mb-6 sm:text-center'}`}>
                    "{quote.content}"
                  </blockquote>
                  <div className={`text-sm text-theme-muted font-medium tracking-wide ${viewMode === 'minimal' ? 'text-right' : 'sm:text-center'}`}>
                    — {quote.author} {quote.source && `《${quote.source}》`}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {poem && (
            <motion.div
              layout
              key={poem.id + viewMode}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className={viewMode === 'detailed' ? "md:col-span-1" : ""}
            >
              <Card
                title="每日一诗"
                icon={<Feather size={18} />}
                onRefresh={handleRefreshPoem}
                onShare={() => handleShare('poem', poem)}
                onWriteNote={() => setNoteTarget({ type: 'poem', item: poem })}
                hasNote={!!getNoteByItemId(poem.id)}
                isLoading={loadingPoem}
                isMinimal={viewMode === 'minimal'}
              >
                {viewMode === 'detailed' ? (
                  <div className="flex flex-col items-center justify-start h-full py-4 sm:py-6">
                    <h3 className="text-2xl font-serif text-theme-primary mb-3 text-center">{poem.title}</h3>
                    <p className="text-sm text-theme-muted mb-6 font-serif tracking-widest text-center">{poem.dynasty} · {poem.author}</p>
                    <div className="font-serif text-lg text-theme-primary whitespace-pre-wrap leading-[2.5] flex justify-center w-full">
                      <div className="inline-block text-left max-w-full">
                        {poem.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-theme-primary mb-1">{poem.title} <span className="text-sm text-theme-muted font-normal ml-2">{poem.author}</span></h3>
                    <div className="font-serif text-base text-theme-primary whitespace-pre-wrap leading-loose mt-2">
                      {poem.content}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          <div className={`flex flex-col gap-6 ${viewMode === 'detailed' ? "md:col-span-1" : "gap-4"}`}>
            {book && (
              <motion.div
                layout
                key={book.id + viewMode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                <Card
                  title="每日一书"
                  icon={<BookOpen size={18} />}
                  onRefresh={handleRefreshBook}
                  onShare={() => handleShare('book', book)}
                  onWriteNote={() => setNoteTarget({ type: 'book', item: book })}
                  hasNote={!!getNoteByItemId(book.id)}
                  isLoading={loadingBook}
                  isMinimal={viewMode === 'minimal'}
                >
                  <div className={`flex items-start ${viewMode === 'minimal' ? 'gap-3' : 'gap-5'}`}>
                    <BookCover
                      coverUrl={book.coverUrl}
                      coverEmoji={book.coverEmoji}
                      title={book.title}
                      size={viewMode === 'minimal' ? 'small' : 'large'}
                    />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <h3 className={`${viewMode === 'minimal' ? 'text-base' : 'text-lg'} font-bold text-theme-primary leading-snug mb-0`}>{book.title}</h3>
                      <p className="text-sm text-theme-accent font-medium mb-0">{book.author}</p>
                      {book.rating && (
                        <div className="flex items-center gap-2 text-amber-500 text-sm font-medium">
                          {renderStars(book.rating)}
                          <span>{book.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {viewMode === 'detailed' && (
                        <p className="text-theme-secondary leading-relaxed text-sm mt-1 mb-0">
                          {book.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {idiom && (
              <motion.div
                layout
                key={idiom.id + viewMode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              >
                <Card
                  title="每日成语"
                  icon={<ScrollText size={18} />}
                  onRefresh={handleRefreshIdiom}
                  onShare={() => handleShare('idiom', idiom)}
                  onWriteNote={() => setNoteTarget({ type: 'idiom', item: idiom })}
                  hasNote={!!getNoteByItemId(idiom.id)}
                  isLoading={loadingIdiom}
                  isMinimal={viewMode === 'minimal'}
                >
                  <div className={`flex flex-col ${viewMode === 'minimal' ? 'gap-1.5 pl-3 border-l-2' : 'gap-3 pl-5 border-l-4'} border-theme-border py-2 my-auto`}>
                    {renderIdiom(idiom.word, idiom.pinyin, viewMode === 'minimal')}
                    <p className={`text-theme-secondary leading-relaxed mt-1 ${viewMode === 'minimal' ? 'text-xs' : 'text-sm'}`}>
                      {idiom.explanation}
                    </p>
                    {viewMode === 'detailed' && idiom.source && (
                      <p className="text-theme-muted text-xs mt-1">— {idiom.source}</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      </div>
    );
  };

  const renderFavoriteItem = (fav: any) => {
    switch (fav.type) {
      case 'quote':
        return (
          <div className="bg-theme-card p-4 rounded-xl border border-theme-border mb-3 shadow-[var(--card-shadow)]">
            <p className="font-serif text-lg mb-2 text-theme-primary">"{fav.data.content}"</p>
            <p className="text-xs text-right text-theme-muted">— {fav.data.author}</p>
          </div>
        );
      case 'poem':
        return (
          <div className="bg-theme-card p-4 rounded-xl border border-theme-border mb-3 shadow-[var(--card-shadow)]">
            <h4 className="font-bold mb-1 text-theme-primary">{fav.data.title}</h4>
            <p className="text-xs text-theme-muted mb-2">{fav.data.author}</p>
            <p className="font-serif text-sm whitespace-pre-wrap text-theme-secondary">{fav.data.content}</p>
          </div>
        );
      case 'book':
        return (
          <div className="bg-theme-card p-4 rounded-xl border border-theme-border mb-3 shadow-[var(--card-shadow)] flex items-center gap-3">
            <div className="text-2xl">{fav.data.coverEmoji}</div>
            <div>
              <h4 className="font-bold text-sm text-theme-primary">{fav.data.title}</h4>
              <p className="text-xs text-theme-muted">{fav.data.author}</p>
            </div>
          </div>
        );
      case 'idiom':
        return (
          <div className="bg-theme-card p-4 rounded-xl border border-theme-border mb-3 shadow-[var(--card-shadow)] flex flex-col gap-2">
            {renderIdiom(fav.data.word, fav.data.pinyin, true)}
            <p className="text-sm text-theme-secondary mt-1">{fav.data.explanation}</p>
          </div>
        );
      case 'history':
        return (
          <div className="bg-theme-card p-4 rounded-xl border border-theme-border mb-3 shadow-[var(--card-shadow)] flex gap-3 items-baseline">
            <span className="font-mono font-bold text-theme-accent text-sm">{fav.data.year}</span>
            <p className="text-sm text-theme-primary">{fav.data.event}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-primary transition-colors duration-300 pb-24 selection:bg-theme-accent/20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-theme-bg/80 backdrop-blur-md border-b border-theme-border px-4 py-4 md:px-0 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-theme-accent p-1.5 rounded-lg text-theme-card transition-colors duration-300">
                <Sparkles size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-theme-primary transition-colors duration-300">微光</h1>
            </div>
            {syncStatus === 'synced' && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium" title="已成功建立云端同步，数据持久且安全">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden xs:inline">云端同步</span>
              </span>
            )}
            {syncStatus === 'local' && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium animate-fade-in" title="由于匿名登录限制，当前处于本地安全缓存模式，不影响任何功能的使用">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="hidden xs:inline">本地离线引擎</span>
                <span className="xs:hidden">本地</span>
              </span>
            )}
            {syncStatus === 'checking' && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-theme-sec text-theme-muted text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-muted animate-ping" />
                <span className="hidden xs:inline">同步检测...</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Selector Pill Bar */}
            <div className="flex items-center gap-1 bg-theme-sec p-1 rounded-full border border-theme-border transition-colors duration-300" title={`当前主题: ${theme === 'auto' ? '自动' : theme === 'light' ? '纯白' : '曜黑'}`}>
              {[
                { id: 'auto', name: '自动', bg: 'bg-gradient-to-r from-gray-300 via-gray-500 to-slate-800' },
                { id: 'light', name: '纯白', bg: 'bg-white border border-gray-300' },
                { id: 'dark', name: '曜黑', bg: 'bg-slate-900 border border-slate-700' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`relative w-6 h-6 rounded-full transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-90 ${t.bg} ${
                    theme === t.id ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 shadow-sm' : 'opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`切换到 ${t.name} 主题`}
                >
                  {theme === t.id && (
                    <span className={`w-1.5 h-1.5 rounded-full ${t.id === 'light' ? 'bg-indigo-600' : 'bg-white'}`} />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFocusMode(true)}
              className="p-1.5 rounded-full text-theme-muted hover:text-theme-primary hover:bg-theme-sec transition-colors"
              title="专注与正念"
            >
              <Target size={20} />
            </button>

            {/* View Mode controls */}
            <div className="hidden sm:flex bg-theme-sec p-1 rounded-full border border-theme-border transition-colors duration-300">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-1.5 rounded-full transition-all relative ${autoRefresh ? 'bg-theme-card shadow-sm text-amber-500' : 'text-theme-muted hover:text-theme-secondary'}`}
                title={autoRefresh ? "自动刷新已开启 (5分钟)" : "开启自动刷新 (5分钟)"}
              >
                <Timer size={16} />
                {autoRefresh && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                )}
              </button>
              <div className="w-px h-4 bg-theme-border mx-1 my-auto"></div>
              <button
                onClick={() => setViewMode('detailed')}
                className={`p-1.5 rounded-full transition-all ${viewMode === 'detailed' ? 'bg-theme-card shadow-sm text-theme-accent' : 'text-theme-muted hover:text-theme-secondary'}`}
                title="详细模式"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('minimal')}
                className={`p-1.5 rounded-full transition-all ${viewMode === 'minimal' ? 'bg-theme-card shadow-sm text-theme-accent' : 'text-theme-muted hover:text-theme-secondary'}`}
                title="极简模式"
              >
                <LayoutList size={16} />
              </button>
            </div>

            <button
              onClick={() => setShowNotes(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-theme-sec text-theme-secondary border border-transparent hover:border-theme-border transition-all duration-200 shrink-0"
            >
              <NotebookPen size={18} />
              <span className="text-sm font-medium hidden sm:inline">微光笔记</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Floating Action Button for Refresh */}
      {!(loadingQuote && loadingPoem && loadingBook && loadingIdiom) && (
        <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none fade-in">
          <button
            onClick={handleManualLoadAll}
            className="pointer-events-auto flex items-center gap-2 bg-theme-accent text-theme-card px-6 py-3.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:opacity-90 hover:scale-105 active:scale-95 transition-all text-white font-medium"
          >
            <RefreshCw size={18} />
            <span className="font-medium tracking-wide">全部刷新</span>
          </button>
        </div>
      )}

      {/* Notes Drawer */}
      {showNotes && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-theme-sec h-full shadow-2xl flex flex-col slide-in-right border-l border-theme-border">
            <div className="flex items-center justify-between px-6 py-4 bg-theme-card border-b border-theme-border">
              <h2 className="text-lg font-bold flex items-center gap-2 text-theme-primary">
                <NotebookPen size={18} className="text-theme-accent" />
                微光笔记
              </h2>
              <button 
                onClick={() => setShowNotes(false)}
                className="p-2 hover:bg-theme-sec rounded-full text-theme-secondary transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[var(--bg)] relative">
              <div className="absolute left-6 top-6 bottom-6 w-px bg-theme-border hidden sm:block"></div>
              {notes.length === 0 ? (
                <div className="text-center text-theme-muted mt-20">
                  <NotebookPen size={48} className="mx-auto mb-4 opacity-20" />
                  <p>暂无手写笔迹</p>
                  <p className="text-sm mt-1">点击卡片上的编辑图标写下感悟</p>
                </div>
              ) : (
                notes.map(note => {
                  const date = note.updatedAt ? new Date(note.updatedAt) : new Date();
                  const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
                  const timeStr = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                  
                  return (
                    <div key={note.id} className="relative group sm:pl-10">
                      <div className="hidden sm:flex absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-theme-accent ring-4 ring-theme-bg shadow-sm"></div>
                      
                      <div className="mb-2 flex items-baseline gap-2">
                        <span className="font-serif font-bold text-theme-primary text-sm">{dateStr}</span>
                        <span className="font-mono text-xs text-theme-muted">{timeStr}</span>
                      </div>
                      
                      <div className="relative">
                        {renderFavoriteItem({ id: note.itemId, type: note.type, data: note.itemData, addedAt: note.updatedAt })}
                        
                        <div className="mt-[-12px] relative z-10 bg-theme-sec/80 backdrop-blur-md p-4 rounded-xl border border-theme-border text-sm font-serif leading-relaxed text-theme-primary shadow-sm">
                          {note.content}
                        </div>

                        <button
                          onClick={() => deleteNote(note.itemId)}
                          className="absolute -top-2 -right-2 p-1.5 bg-theme-card shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10 text-rose-500 border border-theme-border z-20"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal Customizer */}
      <AnimatePresence>
        {isShareOpen && (
          <ShareModal
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            data={shareData}
          />
        )}
      </AnimatePresence>

      {/* Note Edit Modal */}
      <AnimatePresence>
        {noteTarget && (
          <NoteModal
            isOpen={!!noteTarget}
            onClose={() => setNoteTarget(null)}
            onSave={(content) => {
              if (noteTarget) {
                addOrUpdateNote(noteTarget.item.id as string, noteTarget.type, noteTarget.item, content);
              }
            }}
            initialContent={noteTarget ? getNoteByItemId(noteTarget.item.id as string)?.content : ''}
            itemTitle={noteTarget ? (noteTarget.item.title || noteTarget.item.word || '灵感感悟') : ''}
          />
        )}
      </AnimatePresence>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {showFocusMode && (
          <FocusMode onClose={() => setShowFocusMode(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

