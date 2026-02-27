'use client';

interface CircularTimerProps {
  /** Өнгөрсөн хугацаа секундаар */
  elapsedSeconds: number;
  /** Нийт хугацаа минутаар */
  totalMinutes: number;
}

/**
 * SVG circular progress donut timer.
 * stroke-dasharray + stroke-dashoffset technique.
 */
export function CircularTimer({ elapsedSeconds, totalMinutes }: CircularTimerProps) {
  const totalSeconds = totalMinutes * 60;
  const progress = Math.min(elapsedSeconds / totalSeconds, 1);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  // SVG donut тооцоолол
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  // Өнгө — 75%-аас дээш улаан, 50%-аас дээш шар
  const strokeColor = progress >= 0.75 ? '#ef4444' : progress >= 0.5 ? '#f59e0b' : '#9c7aff';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          {/* Суурь тойрог */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000"
          />
        </svg>
        {/* Дундын текст */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black tabular-nums">
            {elapsedMinutes}
            <span className="text-sm font-bold text-slate-400">/{totalMinutes}</span>
          </span>
          <span className="text-[10px] font-bold uppercase text-slate-400">мин</span>
        </div>
      </div>
      <p className="text-xs text-slate-400 text-center">{elapsedMinutes} минут өнгөрсөн байна</p>
    </div>
  );
}
