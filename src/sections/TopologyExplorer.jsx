import React, { useState, useMemo } from 'react'
import ScrollSection from '../components/ScrollSection'
import TabPanel from '../components/TabPanel'
import ForceNetwork from '../viz/ForceNetwork'
import PersistenceDiagram from '../viz/PersistenceDiagram'
import BettiChart from '../viz/BettiChart'
import EntropyChart from '../viz/EntropyChart'
import HeatmapChart from '../viz/HeatmapChart'
import BeeswarmChart from '../viz/BeeswarmChart'
import TreemapChart from '../viz/TreemapChart'
import DendrogramChart from '../viz/DendrogramChart'
import { data, sortedPairs, getOverlap, cuisineIds, computeCompoundCuisineMatrix, computeGISensitivity } from '../data/computed'
import { CUISINE_COLORS, CUISINE_NAMES } from '../data/constants'

export default function TopologyExplorer() {
  const [activeTab, setActiveTab] = useState('network')

  const compoundMatrix = useMemo(() => computeCompoundCuisineMatrix(), [])
  const giSensitivity = useMemo(() => computeGISensitivity(), [])

  const tabs = [
    { id: 'network', label: 'Interactive Network' },
    { id: 'public', label: 'Public-Facing' },
    { id: 'technical', label: 'Technical / Publication' }
  ]

  return (
    <ScrollSection id="topology" title="Topology Explorer">
      <TabPanel tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Network Tab */}
        {activeTab === 'network' && (
          <div className="w-full h-96">
            <ForceNetwork />
          </div>
        )}

        {/* Public-Facing Tab */}
        {activeTab === 'public' && (
          <div className="space-y-6">
            {/* Dendrogram — primary analytical viz for n=10 */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg shadow p-6">
              <DendrogramChart />
              <p className="text-xs text-slate-500 mt-2 text-center">
                UPGMA hierarchical clustering on Jaccard distances. Shows which cuisines share the most flavor compounds.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg shadow p-6">
                <PersistenceDiagram />
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg shadow p-6">
                <BettiChart />
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg shadow p-6">
                <EntropyChart />
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg shadow p-6 overflow-y-auto max-h-96">
                <h3 className="text-lg font-semibold mb-4 text-[#d4a574]">Molecular Bridges</h3>
                <div className="space-y-3">
                  {sortedPairs.slice(0, 15).map((pair, idx) => {
                    const idA = pair.c1
                    const idB = pair.c2
                    const overlap = getOverlap(idA, idB)
                    const nameA = CUISINE_NAMES[idA] || idA
                    const nameB = CUISINE_NAMES[idB] || idB
                    const colorA = CUISINE_COLORS[idA] || '#ccc'
                    const colorB = CUISINE_COLORS[idB] || '#ccc'
                    const compounds = overlap?.shared_compounds || []

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-900 border border-slate-700/70 rounded border-l-4"
                        style={{
                          borderImage: `linear-gradient(to bottom, ${colorA}, ${colorB}) 0 0 0 1`
                        }}
                      >
                        <div className="font-semibold text-sm text-slate-200">
                          {nameA} &harr; {nameB}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Jaccard: {(pair.jaccard * 100).toFixed(1)}% &bull; Shared: {overlap?.shared_count || 0}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          {compounds.slice(0, 4).join(', ')}
                          {compounds.length > 4 && `... +${compounds.length - 4}`}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Technical Tab */}
        {activeTab === 'technical' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg shadow p-6">
                <HeatmapChart />
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg shadow p-6">
                <BeeswarmChart cuisineId="all" />
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg shadow p-6">
                <TreemapChart />
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg shadow p-6 overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4 text-[#d4a574]">Cuisine Statistics</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-700/50">
                      <th className="text-left py-2 px-2 text-slate-300">Cuisine</th>
                      <th className="text-center py-2 px-2 text-slate-300">Meals</th>
                      <th className="text-center py-2 px-2 text-slate-300">Compounds</th>
                      <th className="text-center py-2 px-2 text-slate-300">Ingredients</th>
                      <th className="text-center py-2 px-2 text-slate-300">Avg GI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuisineIds.map(cid => {
                      const cuisine = data.cuisines[cid]
                      if (!cuisine) return null
                      const meals = cuisine.meals || []
                      const compounds = new Set()
                      const ingredients = new Set()
                      let totalGI = 0

                      meals.forEach(m => {
                        if (m.compounds) m.compounds.forEach(c => compounds.add(c))
                        if (m.ingredients) m.ingredients.forEach(ing => ingredients.add(ing))
                        if (m.gi) totalGI += m.gi
                      })

                      const avgGI = meals.length > 0 ? (totalGI / meals.length).toFixed(1) : 'N/A'

                      return (
                        <tr key={cid} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                          <td className="py-2 px-2 font-medium text-slate-200">{CUISINE_NAMES[cid] || cid}</td>
                          <td className="text-center py-2 px-2 text-slate-300">{meals.length}</td>
                          <td className="text-center py-2 px-2 text-slate-300">{compounds.size}</td>
                          <td className="text-center py-2 px-2 text-slate-300">{ingredients.size}</td>
                          <td className="text-center py-2 px-2 text-slate-300">{avgGI}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Compound-Level Analysis Panel */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-[#d4a574]">Compound-Level Analysis (Track B)</h3>
              <p className="text-xs text-slate-400 mb-4">
                Binary presence/absence matrix: {compoundMatrix.metadata.dimensions}.
                Suitable for persistent homology via Hamming distance ({compoundMatrix.totalCompounds} points in {cuisineIds.length}-dimensional space).
              </p>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-800/50 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{compoundMatrix.cuisineCountDistribution.unique}</div>
                  <div className="text-xs text-slate-400">Unique to 1 cuisine</div>
                </div>
                <div className="bg-slate-800/50 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{compoundMatrix.cuisineCountDistribution.rare}</div>
                  <div className="text-xs text-slate-400">Rare (&le;3 cuisines)</div>
                </div>
                <div className="bg-slate-800/50 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-amber-400">{compoundMatrix.cuisineCountDistribution.common}</div>
                  <div className="text-xs text-slate-400">Common (&ge;7 cuisines)</div>
                </div>
                <div className="bg-slate-800/50 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{compoundMatrix.cuisineCountDistribution.universal}</div>
                  <div className="text-xs text-slate-400">Universal (all 10)</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                <strong>Top presence patterns:</strong>{' '}
                {compoundMatrix.patternClusters.slice(0, 5).map((c, i) => (
                  <span key={i} className="inline-block mr-3">
                    {c.compounds.length} compounds in {c.cuisineCount} cuisines
                    {i < 4 ? ' | ' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* GI Sensitivity Analysis */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-[#d4a574]">GI Sensitivity Analysis</h3>
              <p className="text-xs text-slate-400 mb-4">
                Comparison of average GI using all values vs. measured-only values.
                Delta shows the impact of excluding estimated values on per-cuisine averages.
              </p>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-700/50">
                    <th className="text-left py-2 px-2 text-slate-300">Cuisine</th>
                    <th className="text-center py-2 px-2 text-slate-300">Total</th>
                    <th className="text-center py-2 px-2 text-green-400">Measured</th>
                    <th className="text-center py-2 px-2 text-amber-400">Estimated</th>
                    <th className="text-center py-2 px-2 text-slate-300">% Measured</th>
                    <th className="text-center py-2 px-2 text-slate-300">Avg GI (all)</th>
                    <th className="text-center py-2 px-2 text-slate-300">Avg GI (meas.)</th>
                    <th className="text-center py-2 px-2 text-slate-300">&Delta;</th>
                  </tr>
                </thead>
                <tbody>
                  {giSensitivity.map(row => (
                    <tr key={row.cuisine} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                      <td className="py-2 px-2 font-medium text-slate-200">{row.name}</td>
                      <td className="text-center py-2 px-2 text-slate-300">{row.totalMeals}</td>
                      <td className="text-center py-2 px-2 text-green-300">{row.measuredCount}</td>
                      <td className="text-center py-2 px-2 text-amber-300">{row.estimatedCount}</td>
                      <td className="text-center py-2 px-2 text-slate-300">{row.measuredPct}%</td>
                      <td className="text-center py-2 px-2 text-slate-300">
                        {row.avgGI_all != null ? row.avgGI_all.toFixed(1) : 'N/A'}
                      </td>
                      <td className="text-center py-2 px-2 text-slate-300">
                        {row.avgGI_measuredOnly != null ? row.avgGI_measuredOnly.toFixed(1) : 'N/A'}
                      </td>
                      <td className="text-center py-2 px-2 text-slate-300">{row.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </TabPanel>
    </ScrollSection>
  )
}
