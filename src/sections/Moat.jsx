import React, { useMemo } from 'react'
import ScrollSection from '../components/ScrollSection'
import DumbbellChart from '../viz/DumbbellChart'
import { computeTraditionalVsModern } from '../data/computed'

export default function Moat() {
  const tvmData = useMemo(() => computeTraditionalVsModern(), [])

  // Count how many cuisines have measured-only data for both traditional and modern
  const measuredCuisines = tvmData.filter(r => r.measuredOnly.totalMeasured >= 5).length

  return (
    <ScrollSection id="moat" title="Traditional Preparations, Lower Glycemic Impact">
      {/* Narrative Section — honest reframing */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-8 mb-8 text-slate-300 leading-relaxed">
        <p className="mb-4">
          Across the 10 cuisines in this dataset, <strong>minimally processed traditional preparations</strong> (legumes,
          vegetables, whole grains, fermented foods) tend to have lower glycemic indices than
          <strong> industrially processed modern adaptations</strong> (refined grains, sugar-dense desserts, deep-fried items).
        </p>
        <p className="mb-4">
          This is an <em>expected</em> finding from food science: whole foods retain fiber, protein, and fat that slow
          glucose absorption, while industrial processing strips these components. It is not evidence that traditional
          cuisines were &ldquo;optimized&rdquo; for glycemic health &mdash; the glycemic index was not even
          defined until 1981 (Jenkins et al., Am. J. Clin. Nutr.).
        </p>
        <p className="mb-4">
          What is genuinely useful: these data provide <strong>culturally specific, actionable guidance</strong>.
          Rather than prescribing a single &ldquo;Mediterranean diet&rdquo; globally, we can identify low-GI options
          <em> within each cuisine</em> &mdash; foods that are familiar, culturally meaningful, and accessible.
        </p>
        <p className="text-xs text-slate-500 italic">
          Cf. Popkin (2006) &ldquo;Global nutrition transition&rdquo;; Monteiro et al. (2019) NOVA classification;
          Mintz (1985) &ldquo;Sweetness and Power&rdquo;; Pollan (2008) &ldquo;In Defense of Food.&rdquo;
        </p>
      </div>

      {/* Data quality warning */}
      <div className="bg-amber-900/10 border border-amber-800/30 rounded-lg p-4 mb-6 flex items-start gap-3">
        <span className="text-amber-500 text-lg flex-shrink-0">&#9888;</span>
        <div className="text-xs text-amber-300/80">
          <strong>Data limitation:</strong> 83% of GI values in this dataset are category-based estimates,
          not laboratory measurements. Only {measuredCuisines} cuisine(s) have &ge;5 measured GI values across
          both traditional and modern categories. The gap shown below is directionally expected from food science
          but should not be interpreted as a precise quantitative finding until validated with measured data.
        </div>
      </div>

      {/* Dumbbell Chart */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 mb-8">
        <DumbbellChart data={tvmData} />
      </div>

      {/* Measured-only summary */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-sm text-slate-300 mb-3">Measured vs. Estimated GI Comparison</h3>
        <p className="text-xs text-slate-400 mb-4">
          Statistical tests (Welch&apos;s t-test, Bonferroni-corrected &alpha;=0.005, Cohen&apos;s d, 95% bootstrap CI)
          are computed on ALL data including estimates. Below: measured-only subset for validation.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 px-2 text-slate-400">Cuisine</th>
                <th className="text-center py-2 px-2 text-slate-400">All: Gap</th>
                <th className="text-center py-2 px-2 text-slate-400">Stars</th>
                <th className="text-center py-2 px-2 text-green-400">Measured: Trad</th>
                <th className="text-center py-2 px-2 text-orange-400">Measured: Mod</th>
                <th className="text-center py-2 px-2 text-slate-400">Measured: Gap</th>
                <th className="text-center py-2 px-2 text-slate-400">n (measured)</th>
              </tr>
            </thead>
            <tbody>
              {tvmData.map(r => (
                <tr key={r.cuisine} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                  <td className="py-1.5 px-2 text-slate-300">{r.cuisine}</td>
                  <td className="text-center py-1.5 px-2 text-slate-300">+{r.gap.toFixed(1)}</td>
                  <td className="text-center py-1.5 px-2 text-amber-400">{r.statistics.stars || '—'}</td>
                  <td className="text-center py-1.5 px-2 text-green-300">
                    {r.measuredOnly.traditional.count > 0 ? r.measuredOnly.traditional.avgGI.toFixed(1) : '—'}
                  </td>
                  <td className="text-center py-1.5 px-2 text-orange-300">
                    {r.measuredOnly.modern.count > 0 ? r.measuredOnly.modern.avgGI.toFixed(1) : '—'}
                  </td>
                  <td className="text-center py-1.5 px-2 text-slate-300">
                    {r.measuredOnly.gap != null ? (r.measuredOnly.gap > 0 ? '+' : '') + r.measuredOnly.gap.toFixed(1) : '—'}
                  </td>
                  <td className="text-center py-1.5 px-2 text-slate-500">{r.measuredOnly.totalMeasured}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Cards — reframed honestly */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-l-4 border-green-500 bg-green-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-lg text-green-400 mb-3">The Observation</h3>
          <p className="text-sm text-green-300/90">
            Traditional preparations use whole, minimally processed ingredients that naturally have lower glycemic
            indices. This is a well-established food science finding, not a novel discovery. What&apos;s new here
            is mapping it across 10 diverse cuisines simultaneously.
          </p>
        </div>

        <div className="border-l-4 border-orange-500 bg-orange-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-lg text-orange-400 mb-3">The Practical Insight</h3>
          <p className="text-sm text-orange-300/90">
            Every cuisine studied has low-GI options within its traditional repertoire. Dietary guidance
            that works <em>with</em> cultural food identity &mdash; rather than against it &mdash; may
            improve adherence for populations not served by Mediterranean-centric recommendations.
          </p>
        </div>
      </div>
    </ScrollSection>
  )
}
