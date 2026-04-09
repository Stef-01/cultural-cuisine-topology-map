import useStore from '../store'

/**
 * Public/Researcher view mode toggle.
 * Public: simplified language, infographic-style, no statistical jargon.
 * Researcher: full p-values, effect sizes, CIs, compound-level TDA, downloadable data.
 */
export default function ViewToggle() {
  const { viewMode, setViewMode } = useStore()

  return (
    <div className="flex items-center gap-1 bg-slate-800/50 rounded-full p-0.5">
      <button
        onClick={() => setViewMode('public')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
          viewMode === 'public'
            ? 'bg-[#d4a574] text-[#0a0a0f]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={viewMode === 'public'}
      >
        Public
      </button>
      <button
        onClick={() => setViewMode('researcher')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
          viewMode === 'researcher'
            ? 'bg-blue-500 text-white'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={viewMode === 'researcher'}
      >
        Researcher
      </button>
    </div>
  )
}
