'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** A brief brand reveal, tied to scene/font readiness with a bounded fallback. */
export default function LoadingIntro({ ready, onReveal }: { ready: boolean; onReveal: () => void }) {
  const [finished, setFinished] = useState(false);
  const revealed = useRef(false);
  const finish = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    setFinished(true);
    onReveal();
  }, [onReveal]);

  useEffect(() => {
    // No WebGL or a slow font must never strand someone behind the intro.
    const fallback = window.setTimeout(finish, 2200);
    return () => window.clearTimeout(fallback);
  }, [finish]);

  useEffect(() => {
    let cancelled = false;
    if (ready) document.fonts.ready.then(() => { if (!cancelled) finish(); });
    return () => { cancelled = true; };
  }, [ready, finish]);

  return (
    <AnimatePresence>
      {!finished && (
        <motion.div
          className="loading-intro"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="loading-topline"><span>Joy Shah</span><span>Portfolio / 2026</span></div>
          <motion.div className="loading-center" exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
            <div className="loading-symbol"><span /><span /><span /><span /></div>
            <span className="loading-label">Loading my portfolio</span>
          </motion.div>
          <div className="loading-bottomline"><span>Software engineering · Applied AI</span><span className="loading-dots"><i /><i /><i /></span></div>
          <div className="loading-track"><span /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
