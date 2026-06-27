import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, X, Loader2, Maximize2, Target } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export function FocusMode({ onClose }: { onClose: () => void }) {
  const [duration, setDuration] = useState(15 * 60); // 15 mins default
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Adjust audio
  useEffect(() => {
    if (isActive && audioRef.current) {
      audioRef.current.play().catch(e => console.error(e));
    } else if (!isActive && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isActive]);

  const handleSessionComplete = async () => {
    // Save session to Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        const id = `session_${Date.now()}`;
        await setDoc(doc(db, `users/${user.uid}/focusSessions`, id), {
          duration: duration,
          completedAt: Date.now()
        });
      } catch (err) {
        console.error("Failed to save focus session to Firestore:", err);
        saveSessionLocally();
      }
    } else {
      saveSessionLocally();
    }
  };

  const saveSessionLocally = () => {
    try {
      const saved = localStorage.getItem('daily_spark_focus_sessions') || '[]';
      const sessions = JSON.parse(saved);
      sessions.push({
        id: `session_${Date.now()}`,
        duration: duration,
        completedAt: Date.now()
      });
      localStorage.setItem('daily_spark_focus_sessions', JSON.stringify(sessions));
    } catch (err) {
      console.error("Failed to save focus session locally:", err);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (mins: number) => {
    setIsActive(false);
    setDuration(mins * 60);
    setTimeLeft(mins * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Breathing animation states
  const actionText = isActive ? '呼 —— 吸' : '准备专注';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-theme-bg/95 backdrop-blur-xl">
      <audio
        ref={audioRef}
        src="https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg"
        loop
      />
      <div className="absolute top-6 right-6">
        <button onClick={onClose} className="p-3 bg-theme-card border border-theme-border rounded-full hover:bg-theme-sec transition text-theme-secondary">
          <X size={24} />
        </button>
      </div>

      <div className="text-center w-full max-w-md px-4 sm:px-6">
        <div className="mb-8 sm:mb-12 flex justify-center text-theme-accent opacity-50">
          <Target size={48} />
        </div>

        <motion.div 
          animate={isActive ? { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] } : { scale: 1 }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto w-56 h-56 sm:w-64 sm:h-64 border-[1px] border-theme-accent/30 rounded-full flex items-center justify-center relative shadow-[0_0_80px_rgba(var(--accent-rgb),0.1)]"
        >
          <div className="absolute inset-3 sm:inset-4 rounded-full border border-theme-accent/20"></div>
          <div className="absolute inset-6 sm:inset-8 rounded-full border border-theme-accent/10 bg-theme-accent/5"></div>
          
          <div className="z-10 flex flex-col items-center">
            <span className="font-mono text-5xl sm:text-6xl font-light text-theme-primary tracking-tighter shadow-sm mb-2">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm font-serif text-theme-muted tracking-widest">{actionText}</span>
          </div>
        </motion.div>

        <div className="mt-10 sm:mt-16 flex items-center justify-center flex-wrap gap-2 sm:gap-4">
          {[5, 15, 25, 45].map((mins) => (
            <button
              key={mins}
              onClick={() => resetTimer(mins)}
              disabled={isActive}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs sm:text-sm font-medium transition ${
                duration === mins * 60 
                ? 'border-theme-accent bg-theme-accent/10 text-theme-accent' 
                : 'border-theme-border text-theme-secondary hover:bg-theme-sec disabled:opacity-50'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 flex justify-center">
          <button
            onClick={toggleTimer}
            className="flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 rounded-full bg-theme-primary text-theme-bg shadow-xl hover:scale-105 active:scale-95 transition-all text-base sm:text-lg font-bold"
          >
            {isActive ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
            {isActive ? '暂停' : '开始正念'}
          </button>
        </div>
      </div>
    </div>
  );
}
