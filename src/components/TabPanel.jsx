/**
 * A reusable tabbed panel component with dark theme
 * Features:
 * - Uses .tab-btn and .tab-btn.active CSS classes from index.css
 * - Dark themed tabs and content
 * - Smooth transitions between tabs
 * @param {Array<{id: string, label: string}>} tabs - Array of tab definitions
 * @param {string} activeTab - ID of the currently active tab
 * @param {Function} onTabChange - Callback when tab changes, receives tab id
 * @param {React.ReactNode} children - Child content to render below tabs
 */
const TabPanel = ({ tabs, activeTab, onTabChange, children }) => {
  return (
    <div className="w-full">
      {/* Tab Buttons */}
      <div className="flex gap-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`tab-btn px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'active' : ''
            }`}
            style={
              activeTab === tab.id
                ? {
                    backgroundColor: '#d4a574',
                    color: '#0a0a0f',
                    borderColor: '#d4a574',
                    fontWeight: '600',
                  }
                : {
                    color: '#a8a09a',
                  }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {children}
      </div>
    </div>
  );
};

export default TabPanel;
