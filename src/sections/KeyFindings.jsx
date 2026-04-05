import React, { useMemo } from 'react'
import ScrollSection from '../components/ScrollSection'
import { computeTraditionalVsModern, computeEntropyPerCuisine, computeDendrogram, computeCompoundCuisineMatrix, sortedPairs } from '../data/computed'
import { CUISINE_NAMES, CUISINE_COLORS } from '../data/constants'

/**
 * Key Findings summary — the "so what?" of the entire analysis.
 * Presents the top-level insights in a compelling, scannable format.
 */
export default function KeyFindings() {
  const tvm = useMemo(() => computeTraditionalVsModern(), [])
  const entropy = useMemo(() => computeEntropyPerCuisine(), [])
  const compoundData = useMemo(() => computeCompoundCuisineMatrix(), [])

  // Find the most significant traditional-modern gaps
  const significantGaps = tvm
    .filter(r => r.statistics?.tTest?.significant)
    .sort((a, b) => b.gap - a.gap)

  const avgGap = tvm.reduce((s, r) => s + r.gap, 0) / tvm.length

  // Most similar pair
  const topPair = sortedPairs[0]

  // Most unique cuisine (lowest entropy = most unique compounds)
  const mostUnique = entropy[entropy.length - 1]

  // Most diverse cuisine (highest entropy)
  const mostDiverse = entropy[0]

  return (
    <ScrollSection id="findings" title="Key Findings">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Finding 1: Traditional GI Gap */}
        <div className="bg-gradient-to-br from-green-900/20 to-slate-900/50 border border-green-800/30 rounded-xl p-6">
          <div className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-2">Finding 1</div>
          <h3 className="text-lg font-bold text-slate-200 mb-3">
            Traditional foods average {avgGap.toFixed(0)} GI points lower
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Across all 10 cuisines, traditional preparations (legumes, vegetables, fermented foods, whole grains)
            have consistently lower glycemic indices than modern adaptations (refined grains, desserts, fried foods).
          </p>
          {significantGaps.length > 0 && (
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-green-400 font-semibold mb-2">
                Statistically significant gaps (Bonferroni p &lt; 0.005):
              </div>
              {significantGaps.slice(0, 4).map(r => (
                <div key={r.cuisine} className="flex items-center justify-between text-xs py-1">
                  <span style={{ color: CUISINE_COLORS[r.cuisine] }}>
                    {CUISINE_NAMES[r.cuisine]}
                  </span>
                  <span className="text-slate-300">
                    +{r.gap.toFixed(1)} GI gap {r.statistics.stars}
                    <span className="text-slate-500 ml-1">(d={r.statistics.cohensD.toFixed(1)})</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Finding 2: Universal Flavor Bridges */}
        <div className="bg-gradient-to-br from-amber-900/20 to-slate-900/50 border border-amber-800/30 rounded-xl p-6">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">Finding 2</div>
          <h3 className="text-lg font-bold text-slate-200 mb-3">
            {compoundData.cuisineCountDistribution.universal} compounds are universal
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Out of {compoundData.totalCompounds} total flavor compounds,
            {' '}{compoundData.cuisineCountDistribution.universal} appear in all 10 cuisines and
            {' '}{compoundData.cuisineCountDistribution.unique} are unique to just one cuisine.
            This suggests a shared molecular foundation beneath cultural diversity.
          </p>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-amber-400 font-semibold mb-2">Compound distribution:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Unique (1 cuisine)</span>
                <span className="text-slate-200">{compoundData.cuisineCountDistribution.unique}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rare (&le;3)</span>
                <span className="text-slate-200">{compoundData.cuisineCountDistribution.rare}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Common (&ge;7)</span>
                <span className="text-slate-200">{compoundData.cuisineCountDistribution.common}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Universal (all 10)</span>
                <span className="text-slate-200">{compoundData.cuisineCountDistribution.universal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Finding 3: Strongest molecular bridge */}
        <div className="bg-gradient-to-br from-blue-900/20 to-slate-900/50 border border-blue-800/30 rounded-xl p-6">
          <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Finding 3</div>
          <h3 className="text-lg font-bold text-slate-200 mb-3">
            {CUISINE_NAMES[topPair?.c1]} &amp; {CUISINE_NAMES[topPair?.c2]} are molecular cousins
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            The highest Jaccard similarity ({(topPair?.jaccard * 100).toFixed(1)}%) reveals an unexpected
            molecular kinship. These cuisines share {topPair?.shared_count || 'many'} flavor compounds
            despite geographic distance, suggesting convergent culinary evolution.
          </p>
          <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400">
            Top shared compounds: {(topPair?.shared_compounds || []).slice(0, 6).join(', ')}
          </div>
        </div>

        {/* Finding 4: Entropy spectrum */}
        <div className="bg-gradient-to-br from-purple-900/20 to-slate-900/50 border border-purple-800/30 rounded-xl p-6">
          <div className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-2">Finding 4</div>
          <h3 className="text-lg font-bold text-slate-200 mb-3">
            {CUISINE_NAMES[mostUnique?.cuisine]} has the most unique flavor identity
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Shannon entropy analysis reveals that <strong style={{ color: CUISINE_COLORS[mostUnique?.cuisine] }}>
            {CUISINE_NAMES[mostUnique?.cuisine]}</strong> has the lowest compound-sharing entropy
            ({mostUnique?.entropy.toFixed(2)} bits), meaning its flavor compounds are the most
            distinctive. <strong style={{ color: CUISINE_COLORS[mostDiverse?.cuisine] }}>
            {CUISINE_NAMES[mostDiverse?.cuisine]}</strong> has the highest ({mostDiverse?.entropy.toFixed(2)} bits),
            sharing compounds broadly.
          </p>
          <div className="bg-slate-900/50 rounded-lg p-3 text-xs">
            <div className="flex justify-between text-slate-400 mb-1">
              <span style={{ color: CUISINE_COLORS[mostUnique?.cuisine] }}>
                {CUISINE_NAMES[mostUnique?.cuisine]}: {mostUnique?.uniqueCount} unique compounds
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span style={{ color: CUISINE_COLORS[mostDiverse?.cuisine] }}>
                {CUISINE_NAMES[mostDiverse?.cuisine]}: {mostDiverse?.universalCount} universal compounds
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-gradient-to-r from-[#d4a574]/10 to-transparent border border-[#d4a574]/20 rounded-xl p-8 text-center">
        <p className="text-lg text-slate-300 mb-2">
          <strong className="text-[#d4a574]">The bottom line:</strong> Every cuisine has low-GI traditional
          options that are molecularly rich and culturally authentic.
        </p>
        <p className="text-sm text-slate-500">
          You don&apos;t need to abandon your food culture to eat well. You just need to choose
          the traditional preparations your grandmother would recognize.
        </p>
      </div>
    </ScrollSection>
  )
}
