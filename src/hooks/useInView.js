import { useEffect, useRef, useState } from 'react';

/**
 * Hook that tracks if an element is in the viewport using IntersectionObserver
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (default: 0.2)
 * @param {boolean} options.once - Trigger callback only once (default: true)
 * @returns {[React.RefObject, boolean]} - [ref, isInView]
 */
const useInView = (options = {}) => {
  const { threshold = 0.2, once = true } = options;
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          hasTriggered.current = true;

          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  return [ref, isInView];
};

export default useInView;
