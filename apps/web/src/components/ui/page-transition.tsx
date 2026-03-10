'use client';

import { useContext, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/** Хуудас хоорондын шилжилтийн animation variants */
const variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' as const },
  },
};

/**
 * Exit animation дээр хуучин хуудасны контентыг хөлдөөх (freeze).
 * Next.js App Router navigate хийхэд children-ийг шууд солидог тул
 * AnimatePresence exit animation тоглуулахад хуучин контент алга болдог.
 * LayoutRouterContext-ийг ref-д хадгалж хуучин контентыг хадгална.
 */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;

  return <LayoutRouterContext.Provider value={frozen}>{children}</LayoutRouterContext.Provider>;
}

/** Хуудас mount/unmount болоход fade + slide animation хийх wrapper */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col flex-1"
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
