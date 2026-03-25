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
  const isVisible = useRef(false);
  const rafId = useRef<number>(0);

  const runAnimation = (from: number, to: number) => {
    cancelAnimationFrame(rafId.current);
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(from + (to - from) * eased);
      if (progress < 1) rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
  };

  // Start animation when element becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          runAnimation(0, end);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(rafId.current); };
  }, []);

  // Re-animate when end value changes (e.g. user picks different weekly amount)
  useEffect(() => {
    if (isVisible.current) {
      runAnimation(count, end);
    }
  }, [end]);

  return (
    <span ref={ref}>
      {prefix}{count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}{suffix}
    </span>
  );
};
