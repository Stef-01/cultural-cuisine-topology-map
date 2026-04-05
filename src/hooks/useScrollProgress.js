import { useEffect, useState } from 'react';

/**
 * Hook that tracks window scroll progress as a value between 0 and 1
 * @returns {number} - Scroll progress from 0 to 1
 */
const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;

      if (documentHeight <= 0) {
        setProgress(0);
        return;
      }

      const scrolled = window.scrollY;
      const scrollProgress = scrolled / documentHeight;
      setProgress(Math.min(scrollProgress, 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
};

export default useScrollProgress;
