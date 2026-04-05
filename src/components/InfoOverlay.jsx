import { useState } from 'react'

/**
 * "How to Read This" overlay for visualizations.
 * Shows an info button that expands to a contextual explanation.
 */
export default function InfoOverlay({ title, children }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-slate-800/80 border border-slate-700/50
                   text-slate-400 hover:text-[#d4a574] hover:border-[#d4a574]/30 transition-all
                   flex items-center justify-center text-xs font-bold"
        title="How to read this visualization"
        aria-label={`Information about ${title}`}
      >
        ?
      </button>

      {isOpen && (
        <div className="absolute top-10 right-2 z-20 w-72 bg-slate-900/95 border border-slate-700/50 rounded-lg p-4 backdrop-blur shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-[#d4a574]">{title}</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              &times;
            </button>
          </div>
          <div className="text-xs text-slate-400 leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
