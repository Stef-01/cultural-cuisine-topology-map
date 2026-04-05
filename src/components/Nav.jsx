import useScrollProgress from '../hooks/useScrollProgress';

const SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'problem', label: 'Problem' },
  { id: 'globe', label: 'Globe' },
  { id: 'topology', label: 'Topology' },
  { id: 'compounds', label: 'Compounds' },
  { id: 'clinical', label: 'Clinical' },
  { id: 'moat', label: 'Moat' },
  { id: 'methodology', label: 'Methodology' },
];

/**
 * Sticky top navigation bar for the cuisine topology app
 * Features:
 * - Dark translucent background with backdrop blur
 * - Progress bar at top
 * - Left: App title
 * - Center: Section dot indicators with active state based on scroll position
 * - Right: Navigation buttons
 * - Smooth scroll on click
 */
const Nav = () => {
  const scrollProgress = useScrollProgress();

  const handleScroll = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate active section based on scroll progress
  const activeSection = Math.floor(scrollProgress * SECTIONS.length);

  return (
    <>
      {/* Progress bar */}
      <div
        className="fixed top-0 left-0 h-1 z-50"
        style={{
          width: `${scrollProgress * 100}%`,
          backgroundColor: '#d4a574',
          transition: 'width 0.1s ease-out',
        }}
      />

      <nav
        className="fixed top-0 w-full z-40 px-6 py-4"
        style={{
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(12px)',
          marginTop: '4px',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Title */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-sm font-serif truncate"
              style={{
                fontFamily: 'Georgia, serif',
                color: '#d4a574',
                letterSpacing: '0.05em',
              }}
            >
              Cultural Cuisine Topology Map
            </h1>
          </div>

          {/* Center: Section Dots (hidden on small mobile) */}
          <div className="flex-1 hidden sm:flex justify-center gap-3 px-4">
            {SECTIONS.map((section, index) => (
              <button
                key={section.id}
                onClick={() => handleScroll(section.id)}
                title={section.label}
                className="relative group transition-all duration-300"
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeSection
                      ? 'bg-[#d4a574] scale-125'
                      : 'bg-gray-600 hover:bg-gray-400 scale-100'
                  }`}
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {section.label}
                </div>
              </button>
            ))}
          </div>

          {/* Right: Buttons */}
          <div className="flex-1 flex justify-end gap-2 sm:gap-3">
            <button
              onClick={() => handleScroll('topology')}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-300"
              style={{
                color: '#e8e4dd',
                borderColor: 'rgba(212, 165, 116, 0.3)',
                border: '1px solid',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.6)';
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Explore
            </button>
            <button
              onClick={() => handleScroll('clinical')}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-300"
              style={{
                color: '#e8e4dd',
                borderColor: 'rgba(212, 165, 116, 0.3)',
                border: '1px solid',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.6)';
                e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.3)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Clinical Tool
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Nav;
