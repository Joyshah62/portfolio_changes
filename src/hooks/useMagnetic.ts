import { useEffect, useRef } from 'react';

export function useMagnetic(intensity: number = 0.2) {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * intensity;
      const y = (e.clientY - rect.top - rect.height / 2) * intensity;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };

    const handleLeave = () => {
      el.style.transform = 'translate(0px, 0px)';
      el.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
    };

    const handleEnter = () => {
      el.style.transition = 'none'; // remove snap-back transition while hovering
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    el.addEventListener('mouseenter', handleEnter);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      el.removeEventListener('mouseenter', handleEnter);
    };
  }, [intensity]);

  return ref;
}
