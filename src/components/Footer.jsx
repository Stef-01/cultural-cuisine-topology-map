/**
 * Site footer with attribution, key stats, and scroll-to-top.
 */
export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-[#d4a574] mb-3">Cultural Cuisine Topology Map</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multi-dimensional interactive visualization of flavor molecule diversity
              and glycemic impact across world cuisines. Making the case that culturally
              authentic foods already contain the answers to diabetes management.
            </p>
          </div>

          {/* Key Data Sources */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Data Sources</h3>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li>FlavorDB2 (Goel et al., J. Food Sci., 2024)</li>
              <li>FooDB (70,926 compounds)</li>
              <li>Ahn et al. 2011, Sci. Rep. 1:196</li>
              <li>PMC7791047: Non-Western food GI values</li>
              <li>Caprioli et al. 2025, Food Research Intl.</li>
            </ul>
          </div>

          {/* Tech & Methods */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Methods</h3>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li>Jaccard similarity on compound sets</li>
              <li>Persistent homology (Vietoris-Rips)</li>
              <li>UPGMA hierarchical clustering</li>
              <li>Shannon entropy (compound sharing)</li>
              <li>Welch&apos;s t-test, Cohen&apos;s d, bootstrap CI</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            Built with React 18, Three.js, D3.js, Vite 5. For educational purposes only.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700/50 text-xs text-slate-400 hover:text-[#d4a574] hover:border-[#d4a574]/30 transition-all"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
