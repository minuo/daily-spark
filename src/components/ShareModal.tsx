import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Copy, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ShareData {
  type: 'quote' | 'poem' | 'book' | 'idiom';
  title: string;
  itemTitle?: string;
  // Quote / Book / Idiom / Poem details
  content?: string;
  author?: string;
  source?: string;
  dynasty?: string;
  coverEmoji?: string;
  coverUrl?: string;
  word?: string;
  pinyin?: string;
  explanation?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareData | null;
}

type PresetType = 'cream' | 'dark' | 'green' | 'sakura' | 'classic';

interface PresetStyle {
  id: PresetType;
  name: string;
  bgDesc: string;
  badgeClass: string;
}

const PRESETS: PresetStyle[] = [
  { id: 'cream', name: '暖和纸 (Cream)', bgDesc: '米黄竹笺，熟宣书香', badgeClass: 'bg-[#FAF6EE] text-[#2C2C2C] border group-hover:border-[#C9A86A]' },
  { id: 'dark', name: '曜石靛 (Indigo)', bgDesc: '浩瀚星悬，湛蓝深空', badgeClass: 'bg-gradient-to-r from-slate-900 to-indigo-950 text-slate-100 border-none' },
  { id: 'green', name: '青绿山 (Jade)', bgDesc: '山青葱茂，茗香半盏', badgeClass: 'bg-[#E4EBE1] text-[#1E3A2F] border group-hover:border-[#94A891]' },
  { id: 'sakura', name: '樱之华 (Sakura)', bgDesc: '落樱暖金，落日晚霞', badgeClass: 'bg-gradient-to-r from-pink-50 to-[#FFE4E1] text-[#3A1E47] border group-hover:border-[#EAAEA2]' },
  { id: 'classic', name: '水墨白 (Classic)', bgDesc: '简净双栏，经典留白', badgeClass: 'bg-white text-black border border-black' },
];

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('cream');
  const [imgUrl, setImgUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !data) return;

    let isSubscribed = true;

    const drawAndSave = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Pick a random cover if book cover is not provided
      const covers = [
        's1008848.jpg', 's1015872.jpg', 's10199588.jpg', 's1020454.jpg', 
        's10205753.jpg', 's10206185.jpg', 's1024407.jpg', 's1034062.jpg', 
        's10431840.jpg', 's1044902.jpg', 's1045431.jpg', 's1067491.jpg', 
        's1067911.jpg', 's1070222.jpg', 's1070937.jpg', 's1070959.jpg',
        's1076372.jpg', 's1077996.jpg', 's1078958.jpg', 's1099483.jpg'
      ];
      const randomCover = covers[Math.floor(Math.random() * covers.length)];
      
      const getResolvedCoverUrl = (url?: string) => {
        if (!url) return undefined;
        if (url.startsWith('/covers/') || url.startsWith('covers/')) {
          return url.startsWith('/') ? url : `/${url}`;
        }
        if (url.includes('doubanio.com')) {
          const filename = url.substring(url.lastIndexOf('/') + 1);
          if (filename && filename.endsWith('.jpg')) {
            return `/covers/${filename}`;
          }
        }
        const filenameMatch = url.match(/^(s\d+\.jpg)$/);
        if (filenameMatch) {
          return `/covers/${filenameMatch[1]}`;
        }
        return url;
      };

      const resolvedUrl = (data.type === 'book' && data.coverUrl) ? getResolvedCoverUrl(data.coverUrl) : undefined;
      const imgUrlToLoad = resolvedUrl || `/covers/${randomCover}`;

      let loadedImg: HTMLImageElement | null = null;
      if (data.type === 'book' || data.type === 'quote') {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = imgUrlToLoad;
          await new Promise<void>((resolve) => {
            img.onload = () => { loadedImg = img; resolve(); };
            img.onerror = () => { loadedImg = null; resolve(); };
          });
        } catch (e) {
          console.error('Failed to pre-load image', e);
        }
      }

      if (!isSubscribed) return;

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fontSerif = '"Noto Serif SC", "Songti SC", "SimSun", serif';
      const fontSans = '"Inter", "system-ui", "sans-serif"';
      
      // Draw Background
      ctx.fillStyle = '#FDFBF7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Outer Border
      ctx.strokeStyle = '#D1D1D1';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // ---------------- Header Left ----------------
      ctx.fillStyle = '#2C2C2C';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      let sourceText = '《微光 GLOW》';
      if (data.source) sourceText = `《${data.source}》`;
      else if (data.itemTitle) sourceText = `《${data.itemTitle}》`;
      else if (data.title) sourceText = `《${data.title}》`;
      
      ctx.font = `28px ${fontSerif}`;
      ctx.fillText(sourceText, 80, 100);
      
      let authorText = '';
      if (data.author) authorText = `作家，${data.author}`;
      else if (data.dynasty && data.author) authorText = `诗人，[${data.dynasty}] ${data.author}`;
      else if (data.type === 'idiom') authorText = `词语，${data.title}`;
      
      ctx.font = `24px ${fontSans}`;
      ctx.fillText(authorText, 86, 145);

      // ---------------- Header Right (Date) ----------------
      const now = new Date();
      const monthEng = now.toLocaleString('en-US', { month: 'long' }).toUpperCase();
      const dayNum = now.getDate().toString();
      const weekday = now.toLocaleString('zh-CN', { weekday: 'long' });
      let lunarDate = '';
      try {
        const lunarFormatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { month: 'long', day: 'numeric' });
        lunarDate = '农历' + lunarFormatter.format(now);
      } catch(e) {}

      ctx.textAlign = 'center';
      
      ctx.fillStyle = '#000000';
      ctx.font = `40px ${fontSerif}`;
      ctx.fillText(monthEng, 900, 100);
      
      // Giant Day Number
      ctx.font = `220px ${fontSerif}`;
      ctx.fillText(dayNum, 900, 120);

      // Separator Line
      ctx.beginPath();
      ctx.moveTo(820, 370);
      ctx.lineTo(980, 370);
      ctx.strokeStyle = '#2C2C2C';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = `bold 28px ${fontSerif}`;
      ctx.fillText(weekday, 900, 400);
      
      ctx.font = `24px ${fontSerif}`;
      ctx.fillText(lunarDate, 900, 445);

      // ---------------- Middle Text ----------------
      let mainText = data.content || data.title;
      if (data.type === 'idiom' && data.explanation) {
        mainText = data.explanation;
      }
      if (data.type === 'poem' && data.content) {
        mainText = data.content.split('\\n').slice(0, 4).join('，');
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = `44px ${fontSerif}`;
      
      const wrapText = (textStr: string, maxW: number, lineHeight: number, startX: number, startY: number) => {
        const normalized = textStr.replace(/\\n/g, '\n');
        const paragraphs = normalized.split('\n');
        let y = startY;
        
        for (const p of paragraphs) {
          const chars = Array.from(p);
          let currentLine = '';
          for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxW && i > 0) {
              ctx.fillText(currentLine, startX, y);
              y += lineHeight;
              currentLine = char;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) {
            ctx.fillText(currentLine, startX, y);
            y += lineHeight;
          }
        }
        return y;
      };

      let textBottomY = 520;
      
      if (data.type === 'idiom') {
        const word = data.title || '';
        const pinyin = data.pinyin || '';
        const pinyinParts = pinyin.split(/\s+/);
        const chars = Array.from(word);
        
        const boxSize = 120;
        const gap = 20;
        let startX = 80;
        let startY = 520;

        chars.forEach((char, idx) => {
          const x = startX + idx * (boxSize + gap);
          
          ctx.strokeStyle = '#D1D1D1';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, startY, boxSize, boxSize);

          ctx.save();
          ctx.strokeStyle = '#E0E0E0';
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(x + boxSize/2, startY);
          ctx.lineTo(x + boxSize/2, startY + boxSize);
          ctx.moveTo(x, startY + boxSize/2);
          ctx.lineTo(x + boxSize, startY + boxSize/2);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = '#000000';
          ctx.font = `bold 72px ${fontSerif}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(char, x + boxSize/2, startY + boxSize/2 + 5);

          ctx.fillStyle = '#666666';
          ctx.font = `20px ${fontSans}`;
          ctx.textBaseline = 'bottom';
          ctx.fillText(pinyinParts[idx] || '', x + boxSize/2, startY - 10);
        });

        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#2C2C2C';
        ctx.font = `32px ${fontSerif}`;
        textBottomY = wrapText(`【释义】${data.explanation || ''}`, 700, 52, 80, startY + boxSize + 60);

        if (data.source) {
          ctx.fillStyle = '#666666';
          ctx.font = `24px ${fontSerif}`;
          textBottomY = wrapText(`【出处】${data.source}`, 700, 40, 80, textBottomY + 40);
        }
      } else {
        let mainText = data.content || data.title;
        
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = `44px ${fontSerif}`;
        textBottomY = wrapText(mainText, 700, 72, 80, 520);
      }

      // ---------------- Right Vertical Text ----------------
      let yiText = '宜 珍视';
      if (data.type === 'poem') yiText = '宜 赏月';
      if (data.type === 'book') yiText = '宜 读书';
      if (data.type === 'idiom') yiText = '宜 温故';
      if (data.type === 'quote') yiText = '宜 沉思';

      ctx.fillStyle = '#000000';
      ctx.font = `bold 100px ${fontSerif}`;
      ctx.textAlign = 'center';
      
      // Draw vertically
      for (let i = 0; i < yiText.length; i++) {
        const char = yiText[i];
        if (char === ' ') continue;
        ctx.fillText(char, 900, 550 + i * 110);
      }

      // ---------------- Illustration Image ----------------
      if (data.type === 'poem') {
        const radius = 180;
        const imgX = 400;
        
        // Find how much space we have
        const maxAllowedHeight = 1700 - (textBottomY + 80);
        if (maxAllowedHeight > radius * 2) {
          const imgY = textBottomY + 80 + radius;
          
          ctx.beginPath();
          ctx.arc(imgX, imgY, radius, 0, Math.PI * 2);
          const grad = ctx.createLinearGradient(imgX - radius, imgY - radius, imgX + radius, imgY + radius);
          grad.addColorStop(0, 'rgba(232, 228, 217, 0.4)');
          grad.addColorStop(1, 'rgba(213, 206, 196, 0.1)');
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.strokeStyle = '#E0E0E0';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#C0BDB5';
          ctx.font = `italic 64px ${fontSerif}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('诗', imgX, imgY);
        }
      } else if (loadedImg) {
        const imgMaxWidth = 720;
        const maxAllowedHeight = 1700 - (textBottomY + 80);
        const imgMaxHeight = Math.min(800, maxAllowedHeight);
        
        if (imgMaxHeight > 100) {
          let imgW = loadedImg.width;
          let imgH = loadedImg.height;
          
          const scale = Math.min(imgMaxWidth / imgW, imgMaxHeight / imgH);
          imgW = imgW * scale;
          imgH = imgH * scale;

          const imgX = 80;
          const imgY = textBottomY + 80;

          ctx.drawImage(loadedImg, imgX, imgY, imgW, imgH);
        }
      }

      // ---------------- Bottom Footer ----------------
      const bottomY = 1780;
      
      ctx.beginPath();
      ctx.moveTo(80, bottomY - 60);
      ctx.lineTo(1000, bottomY - 60);
      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000000';
      
      ctx.font = '36px sans-serif';
      ctx.fillText('✦', 80, bottomY);
      
      ctx.font = `bold 32px ${fontSans}`;
      ctx.fillText('GLOW × 单向历', 140, bottomY);
      
      ctx.font = `24px ${fontSerif}`;
      ctx.fillStyle = '#666666';
      ctx.fillText('Hi, 跟美好的文字打个招呼', 520, bottomY);
      
      try {
        const url = canvas.toDataURL('image/png');
        setImgUrl(url);
      } catch (err) {
        console.error('Failed to convert canvas to data URL', err);
      }
    };

    // Load fonts and fire render
    if (document.fonts) {
      document.fonts.ready.then(() => {
        drawAndSave();
      });
    } else {
      setTimeout(drawAndSave, 150);
    }

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, selectedPreset, data]);

  const handleDownload = () => {
    if (!imgUrl) return;
    const link = document.createElement('a');
    link.download = `glow-card-${data?.type || 'share'}-${Date.now()}.png`;
    link.href = imgUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    if (!imgUrl) return;
    try {
      // In advanced browsers, we can write direct PNG Blob to clipboard!
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: Copy raw text or notify them to long-press
      console.warn('Clipboard write image failed, trying raw text fallback', err);
      let textToCopy = '';
      if (data?.type === 'quote') {
        textToCopy = `"${data.content}" — ${data.author} ${data.source ? `《${data.source}》` : ''}`;
      } else if (data?.type === 'poem') {
        textToCopy = `《${data.title}》\n${data.dynasty} · ${data.author}\n${data.content}`;
      } else if (data?.type === 'book') {
        textToCopy = `《${data.title}》/ ${data.author}\n${data.content}`;
      } else if (data?.type === 'idiom') {
        textToCopy = `${data.word} (${data.pinyin})\n解析：${data.explanation}`;
      }
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        alert('无法复制到剪贴板，请长按图片保存。');
      }
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl bg-theme-card border border-theme-border rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[92vh]"
      >
        {/* Hidden Canvas Builder */}
        <canvas
          ref={canvasRef}
          width={1080}
          height={1920}
          className="hidden"
        />

        {/* Visual Preview Left Section */}
        <div className="flex-1 bg-theme-sec p-6 md:p-10 flex flex-col items-center justify-center overflow-y-auto border-r border-theme-border relative min-h-[300px] md:min-h-0">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-theme-muted font-mono tracking-wider">
            <Sparkles size={14} className="text-theme-accent animate-pulse" />
            LIVE POSTCARD PREVIEW
          </div>

          <div className="w-full max-w-[280px] md:max-w-[340px] aspect-[9/16] relative rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white group">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt="Share preview card"
                className="w-full h-full object-contain pointer-events-auto select-all"
                style={{ contentVisibility: 'auto' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-theme-muted animate-pulse">正在生成精美卡片...</span>
              </div>
            )}
            
            {/* Soft overlay hint for mobile users */}
            <div className="absolute inset-x-0 bottom-3 text-center pointer-events-none opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-black/70 text-white text-[11px] px-2.5 py-1 rounded-full backdrop-blur-xs font-sans tracking-wide">
                移动端用户可长按卡片直接保存到相册
              </span>
            </div>
          </div>
        </div>

        {/* Customization & Preset Right Options panel */}
        <div className="w-full md:w-[380px] p-6 md:p-8 flex flex-col bg-theme-card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-theme-primary">单向历卡片生成</h2>
              <p className="text-xs text-theme-secondary mt-1">保存今日灵感，将灵思永久凝固</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-theme-sec text-theme-secondary hover:text-theme-primary rounded-full transition-colors border border-theme-border"
              aria-label="关闭分享弹窗"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-4">
             <div className="p-4 bg-theme-sec/50 border border-theme-border rounded-xl">
               <h3 className="text-sm font-semibold text-theme-primary mb-1">日历排版风格</h3>
               <p className="text-xs text-theme-muted">灵感来自经典日历布局，配合优雅黑体与宋体排印。可用于社交媒体分享或收藏。</p>
             </div>
          </div>

          {/* Interactive Share Call-to-actions */}
          <div className="pt-6 border-t border-theme-border mt-6 space-y-2.5">
            <button
              onClick={handleCopyToClipboard}
              disabled={!imgUrl}
              className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-theme-border font-medium text-sm transition-all text-theme-secondary hover:bg-theme-sec hover:text-theme-primary active:scale-98 ${copied ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:text-emerald-600 hover:bg-emerald-500/10' : ''}`}
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-500" strokeWidth={3} />
                  <span>已复制到剪贴板！</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>复制图片 / 摘录 text</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={!imgUrl}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-theme-accent text-white rounded-xl font-medium text-sm hover:opacity-90 active:scale-98 shadow-sm transition-all"
            >
              <Download size={16} />
              <span>下载高清图片 (PNG)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
