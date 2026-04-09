import { CUISINE_COLORS, CUISINE_NAMES } from '../data/constants'

/**
 * Share-friendly finding card for social media.
 * Renders a compact, visually striking summary of a key finding.
 */
export default function ShareCard({ finding, color = '#d4a574', children }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border p-6 max-w-md"
      style={{ borderColor: `${color}30`, background: `linear-gradient(135deg, ${color}08, #0a0a0f)` }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />

      {/* Finding number */}
      <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color }}>
        {finding}
      </div>

      {/* Content */}
      <div className="text-slate-200 text-sm leading-relaxed">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: `${color}20` }}>
        <span className="text-xs text-slate-500">Cultural Cuisine Topology Map</span>
        <span className="text-xs" style={{ color }}>1,932 meals &bull; 10 cuisines &bull; 333 compounds</span>
      </div>
    </div>
  )
}

/**
 * Pre-built share cards for the 4 key findings.
 */
export function ShareCardGallery({ findings }) {
  if (!findings) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ShareCard finding="Key Finding" color="#22c55e">
        <p className="text-lg font-bold mb-2">Traditional foods: lower glycemic impact</p>
        <p className="text-slate-400 text-xs">
          Across 10 world cuisines, minimally processed traditional preparations consistently
          show lower glycemic indices than industrially processed modern adaptations.
          This is expected from food science — and provides culturally-specific dietary guidance.
        </p>
      </ShareCard>

      <ShareCard finding="Data Insight" color="#3b82f6">
        <p className="text-lg font-bold mb-2">333 flavor compounds mapped</p>
        <p className="text-slate-400 text-xs">
          Every cuisine has a unique molecular fingerprint. Yet some compounds appear in all 10 —
          suggesting a shared flavor foundation beneath cultural diversity.
        </p>
      </ShareCard>

      <ShareCard finding="For Your Kitchen" color="#f59e0b">
        <p className="text-lg font-bold mb-2">Every cuisine has healthy options</p>
        <p className="text-slate-400 text-xs">
          You don&apos;t need to switch to a Mediterranean diet. Your own cuisine&apos;s traditional
          preparations — legumes, vegetables, fermented foods, whole grains — are already
          aligned with modern nutritional goals.
        </p>
      </ShareCard>

      <ShareCard finding="Research Note" color="#a855f7">
        <p className="text-lg font-bold mb-2">83% of GI values are estimates</p>
        <p className="text-slate-400 text-xs">
          Only 55 of 1,932 meals have laboratory-measured glycemic indices. This project is
          hypothesis-generating, not confirmatory. More measured data is needed.
        </p>
      </ShareCard>
    </div>
  )
}
