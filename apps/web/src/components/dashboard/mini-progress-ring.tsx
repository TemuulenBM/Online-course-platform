'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface MiniProgressRingProps {
  /** Ахицын хувь (0-100) */
  percentage: number;
  /** Хэмжээ пиксел (default: 40) */
  size?: number;
  /** Зураасны зузаан (default: 3.5) */
  strokeWidth?: number;
}

/**
 * Жижиг дугуй хэлбэрийн ахицын индикатор.
 * Сургалтын карт дотор хэрэглэнэ.
 */
export function MiniProgressRing({
  percentage,
  size = 40,
  strokeWidth = 3.5,
}: MiniProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const isComplete = percentage >= 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Суурь трек */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        {/* Ахицын зураас */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? 'var(--success)' : 'var(--primary)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - Math.min(percentage, 100) / 100) }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>

      {/* Голд тоо эсвэл ✓ */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isComplete ? (
          <Check className="w-4 h-4 text-success" strokeWidth={3} />
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground">
            {Math.round(percentage)}
          </span>
        )}
      </div>
    </div>
  );
}
