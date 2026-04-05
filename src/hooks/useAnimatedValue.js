import { useEffect, useRef, useState } from 'react';

/**
 * Hook that animates a numeric value from 0 to target using requestAnimationFrame
 * @param {number} target - Target value to animate to
 * @param {number} duration - Animation duration in milliseconds (default: 2000)
 * @param {boolean} enabled - Whether animation is enabled (default: true)
 * @returns {number} - Current animated value
 */
const useAnimatedValue = (target, duration = 2000, enabled = true) => {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!enabled || target === 0) {
      setValue(0);
      return;
    }

    const animate = (currentTime) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: ease-out-quad
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentValue = target * easeProgress;

      setValue(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration, enabled]);

  return value;
};

export default useAnimatedValue;
