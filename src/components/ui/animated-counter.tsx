/**
 * AnimatedCounter.tsx
 *
 * Purpose: Animated number counter with easeOutCubic timing
 * Triggers animation when active prop is true
 *
 * Usage:
 * <AnimatedCounter target={130} active={isInView} />
 */

import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  active: boolean;
  duration?: number;
}

export const AnimatedCounter = ({
  target,
  active,
  duration = 1200,
}: AnimatedCounterProps) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      // Reset when leaving view (optional)
      setValue(0);
      return;
    }

    let frame: number;
    const start = performance.now();

    const loop = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // EaseOutCubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return <span>{value}</span>;
};
