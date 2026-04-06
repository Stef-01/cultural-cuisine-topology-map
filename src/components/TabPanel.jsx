import { useCallback } from 'react'

/**
 * Accessible tabbed panel component with proper ARIA tabs pattern.
 * Supports keyboard navigation: arrow keys, Home, End.
 */
const TabPanel = ({ tabs, activeTab, onTabChange, children }) => {
  const handleKeyDown = useCallback((e) => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab)
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        newIndex = (currentIndex + 1) % tabs.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = tabs.length - 1
        break
      default:
        return
    }

    onTabChange(tabs[newIndex].id)
    // Focus the new tab button
    document.getElementById(`tab-${tabs[newIndex].id}`)?.focus()
  }, [tabs, activeTab, onTabChange])

  return (
    <div className="w-full">
      {/* Tab Buttons */}
      <div
        className="flex gap-0 overflow-x-auto"
        role="tablist"
        aria-label="Visualization views"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              className={`tab-btn px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                isActive ? 'active' : ''
              }`}
              style={
                isActive
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
          )
        })}
      </div>

      {/* Tab Content */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="pt-6"
      >
        {children}
      </div>
    </div>
  )
}

export default TabPanel
