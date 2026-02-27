'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, motion } from 'framer-motion';

/** Тоо анимацтай тоологч — framer-motion spring ашиглана */
export function AnimatedCounter({
  value,
  formatFn,
  className,
}: {
  value: number;
  formatFn?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 40,
    stiffness: 100,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        const rounded = Math.round(latest);
        ref.current.textContent = formatFn ? formatFn(rounded) : rounded.toLocaleString();
      }
    });
    return unsubscribe;
  }, [springValue, formatFn]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      0
    </motion.span>
  );
}
