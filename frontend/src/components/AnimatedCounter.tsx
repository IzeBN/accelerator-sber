import { useEffect, useRef, useState } from 'react';

interface Props {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter = ({ end, duration = 1500, prefix = '', suffix = '', decimals = 0 }: Props) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const rafId = useRef<number>(0);
  const hasAnimated = useRef(false);
  const currentCount = useRef(0);

  const runAnimation = (from: number, to: number) => {
    cancelAnimationFrame(rafId.current);
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (to - from) * eased;
      currentCount.current = value;
      setCount(value);
      if (progress < 1) rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
  };

  // First appearance — trigger via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          runAnimation(0, end);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(rafId.current); };
  }, []);

  // Re-animate on every end change after first render
  useEffect(() => {
    if (!hasAnimated.current) return;
    runAnimation(currentCount.current, end);
  }, [end]);

  const formatted = count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  );
};
