import useInView from '../hooks/useInView';

/**
 * A wrapper component that applies fade-up animation when it enters viewport
 * Features:
 * - IntersectionObserver for efficient viewport detection
 * - Fade-up animation via section-hidden/section-visible CSS classes
 * - Optional section header with dark theme
 * @param {string} id - Element ID
 * @param {string} className - Additional CSS classes
 * @param {string} title - Optional section title to render as large header
 * @param {React.ReactNode} children - Child elements
 */
const ScrollSection = ({ id, className = '', title, children }) => {
  const [ref, isInView] = useInView({ threshold: 0.1, once: true });

  return (
    <section
      ref={ref}
      id={id}
      className={`transition-all duration-700 ${
        isInView ? 'section-visible' : 'section-hidden'
      } ${className}`}
    >
      {title && (
        <h2
          className="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight"
          style={{
            color: '#e8e4dd',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
};

export default ScrollSection;
