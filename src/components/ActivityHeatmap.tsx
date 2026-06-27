import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface ActivityHeatmapProps {
  data: Record<string, number>;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, []);
  // Generate last 52 weeks of days (364 days + today = 365)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 364);

  const days: { date: string; count: number }[] = [];
  const curr = new Date(startDate);
  
  while (curr <= endDate) {
    const dateStr = [
      curr.getFullYear(),
      String(curr.getMonth() + 1).padStart(2, '0'),
      String(curr.getDate()).padStart(2, '0')
    ].join('-');
    
    days.push({
      date: dateStr,
      count: data[dateStr] || 0
    });
    
    curr.setDate(curr.getDate() + 1);
  }

  // Weeks are columns. We need to chunk days into columns of 7.
  // The first week might not start on a Sunday, so we pad it.
  const paddingFront = startDate.getDay();
  const paddedDays: (typeof days[0] | null)[] = Array(paddingFront).fill(null);
  const allDays = [...paddedDays, ...days];

  // Group into weeks
  const weeks: (typeof days[0] | null)[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  // To determine color levels: 0, 1-3, 4-9, 10-19, 20+
  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count < 3) return 'bg-orange-200 dark:bg-orange-900/40';
    if (count < 7) return 'bg-orange-400 dark:bg-orange-700/60';
    if (count < 15) return 'bg-orange-500 dark:bg-orange-600';
    return 'bg-orange-600 dark:bg-orange-500';
  };

  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return (
    <div className="mt-8 flex flex-col gap-2 border-t border-theme-border/50 pt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-theme-primary">灵感活跃度</h3>
      </div>
      <div 
        ref={containerRef}
        className="flex flex-col gap-2 overflow-x-auto pb-4 scrollbar-hide"
      >
        <div className="relative h-4 min-w-max text-[10px] text-theme-accent mb-1 overflow-hidden">
          {weeks.map((week, index) => {
            if (index === 0) return null;
          const firstDay = week.find(d => d);
          const prevFirstDay = weeks[index - 1]?.find(d => d);
          if (firstDay && prevFirstDay) {
            const currentMonth = new Date(firstDay.date).getMonth();
            const prevMonth = new Date(prevFirstDay.date).getMonth();
            if (currentMonth !== prevMonth) {
              return (
                <div key={index} className="absolute top-0 whitespace-nowrap" style={{ left: `${index * 14}px` }}>
                  {months[currentMonth]}
                </div>
              );
            }
          }
          return null;
        })}
      </div>
      <div className="flex gap-[3px] min-w-max">
        {weeks.map((week, wIndex) => (
          <div key={`week-${wIndex}`} className="flex flex-col gap-[3px]">
            {week.map((day, dIndex) => {
              if (!day) return <div key={`empty-${dIndex}`} className="w-[11px] h-[11px] rounded-[2px]" />;
              
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} 次互动`}
                  className={`w-[11px] h-[11px] rounded-[2px] transition-colors duration-200 hover:ring-1 hover:ring-theme-primary/50 cursor-pointer ${getColorClass(day.count)}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      </div>
      <div className="flex justify-end items-center gap-1 mt-2 text-xs text-theme-accent">
        <span>少</span>
        <div className="w-[11px] h-[11px] rounded-[2px] bg-gray-100 dark:bg-gray-800" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-orange-200 dark:bg-orange-900/40" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-orange-400 dark:bg-orange-700/60" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-orange-500 dark:bg-orange-600" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-orange-600 dark:bg-orange-500" />
        <span>多</span>
      </div>
    </div>
  );
};
