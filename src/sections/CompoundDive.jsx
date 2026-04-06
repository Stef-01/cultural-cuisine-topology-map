import React, { useState, useMemo } from 'react'
import ScrollSection from '../components/ScrollSection'
import InfoOverlay from '../components/InfoOverlay'
import RadarChart from '../viz/RadarChart'
import FlowChart from '../viz/FlowChart'
import { data, computeFlavorFingerprints, computeUniversalCompounds } from '../data/computed'
import { CUISINE_NAMES, CUISINE_COLORS, COMPOUND_FAMILIES } from '../data/constants'
import useStore from '../store'

function getCompoundFamily(name) {
  for (const [family, members] of Object.entries(COMPOUND_FAMILIES)) {
    if (members.includes(name)) return family
  }
  return 'other'
}

const FAMILY_COLORS = {
  terpenes: '#22c55e',
  sulfides: '#eab308',
  aldehydes: '#3b82f6',
  phenolics: '#ef4444',
  lactones: '#a855f7',
  pyrazines: '#f97316',
  acids: '#06b6d4',
  other: '#64748b',
}

export default function CompoundDive() {
  const [searchQuery, setSearchQuery] = useState('')
  const { selectedCompound, setSelectedCompound } = useStore()

  // Get all unique compounds and track which cuisines contain them
  const allCompounds = useMemo(() => {
    const compounds = {}
    Object.entries(data.cuisines).forEach(([cuisineId, cuisine]) => {
      cuisine.meals?.forEach(meal => {
        meal.compounds?.forEach(c => {
          if (!compounds[c]) {
            compounds[c] = { name: c, cuisines: new Set() }
          }
          compounds[c].cuisines.add(cuisineId)
        })
      })
    })
    Object.entries(compounds).forEach(([name, obj]) => {
      obj.cuisineIds = Array.from(obj.cuisines)
    })
    return Object.values(compounds).sort((a, b) => b.cuisines.size - a.cuisines.size)
  }, [])

  // Filter compounds based on search
  const filteredCompounds = useMemo(() => {
    if (!searchQuery.trim()) return allCompounds
    const query = searchQuery.toLowerCase()
    return allCompounds.filter(c => c.name.toLowerCase().includes(query))
  }, [searchQuery, allCompounds])

  // Get cuisines that contain selected compound
  const compoundCuisines = useMemo(() => {
    if (!selectedCompound) return []
    const cuisines = []
    Object.entries(data.cuisines).forEach(([cid, cuisine]) => {
      const hasMeal = cuisine.meals?.some(m => m.compounds?.includes(selectedCompound))
      if (hasMeal) cuisines.push(cid)
    })
    return cuisines
  }, [selectedCompound])

  // Get ingredients contributing to selected compound
  const compoundIngredients = useMemo(() => {
    if (!selectedCompound) return []
    const ingredients = new Set()
    Object.values(data.cuisines).forEach(cuisine => {
      cuisine.meals?.forEach(meal => {
        if (meal.compounds?.includes(selectedCompound)) {
          meal.ingredients?.forEach(ing => ingredients.add(ing))
        }
      })
    })
    return Array.from(ingredients)
  }, [selectedCompound])

  const fingerprints = useMemo(() => computeFlavorFingerprints(), [])

  return (
    <ScrollSection id="compounds" title="Compound Deep Dive">
      {/* Ingredient → Compound → Cuisine Flow */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 mb-8 relative">
        <InfoOverlay title="How to Read the Flow Diagram">
          <p><strong>Left column:</strong> Top 20 ingredients (by how many cuisines use them). These are the building blocks of flavor.</p>
          <p><strong>Middle column:</strong> Top 25 flavor compounds. Size reflects how many cuisines contain that compound.</p>
          <p><strong>Right column:</strong> The 10 cuisines, colored by their identity.</p>
          <p><strong>Hover</strong> any node to trace its connections — see which ingredients produce which compounds, and which cuisines they flow into.</p>
        </InfoOverlay>
        <h3 className="text-lg font-semibold mb-2 text-[#d4a574]">Ingredient &rarr; Compound &rarr; Cuisine Flow</h3>
        <p className="text-xs text-slate-400 mb-4">
          Trace how raw ingredients contribute flavor compounds to world cuisines. Hover to highlight pathways.
        </p>
        <FlowChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search and Results */}
        <div className="col-span-1 bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 h-fit max-h-[500px] overflow-y-auto">
          <label htmlFor="compound-search" className="sr-only">Search flavor compounds</label>
          <input
            id="compound-search"
            type="text"
            placeholder="Search compounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded mb-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d4a574]"
            aria-label="Search flavor compounds by name"
          />
          <div className="text-xs text-slate-500 mb-2">
            {filteredCompounds.length} compounds{searchQuery && ` matching "${searchQuery}"`}
          </div>
          <div className="space-y-1.5">
            {filteredCompounds.slice(0, 40).map((compound) => {
              const family = getCompoundFamily(compound.name)
              return (
                <button
                  key={compound.name}
                  onClick={() => setSelectedCompound(compound.name)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                    selectedCompound === compound.name
                      ? 'bg-[#d4a574] text-[#0a0a0f]'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{compound.name}</span>
                    <span
                      className="flex-shrink-0 ml-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: FAMILY_COLORS[family] || '#64748b' }}
                      title={family}
                    />
                  </div>
                  <div className="text-xs opacity-75 flex items-center gap-2">
                    <span>{compound.cuisines?.size || 0} cuisines</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="capitalize">{family}</span>
                  </div>
                </button>
              )
            })}
            {filteredCompounds.length > 40 && (
              <div className="text-xs text-slate-500 text-center py-2">
                +{filteredCompounds.length - 40} more — refine your search
              </div>
            )}
          </div>
        </div>

        {/* Compound Details */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {selectedCompound && (
            <>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-200">{selectedCompound}</h3>

                {/* Cuisines containing compound */}
                {compoundCuisines.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm mb-3 text-slate-300">Found in cuisines:</h4>
                    <div className="flex flex-wrap gap-2">
                      {compoundCuisines.map(cid => (
                        <span
                          key={cid}
                          className="px-3 py-1 rounded-full text-white text-sm"
                          style={{ backgroundColor: CUISINE_COLORS[cid] || '#64748b' }}
                        >
                          {CUISINE_NAMES[cid] || cid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                {compoundIngredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-slate-300">Common ingredients:</h4>
                    <div className="flex flex-wrap gap-2">
                      {compoundIngredients.slice(0, 12).map(ing => (
                        <span key={ing} className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-sm">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Radar chart for cuisines with compound */}
              {compoundCuisines.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                  <h4 className="font-semibold text-sm mb-4 text-slate-300">Flavor profile comparison</h4>
                  <RadarChart cuisineIds={compoundCuisines} fingerprints={fingerprints} />
                </div>
              )}
            </>
          )}

          {/* Default: show selected cuisine flavor profile */}
          {!selectedCompound && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
              <h4 className="font-semibold text-sm mb-4 text-slate-300">Select a compound to explore</h4>
              <p className="text-slate-400 text-sm">Use the search box on the left to find compounds by name.</p>
            </div>
          )}
        </div>
      </div>
    </ScrollSection>
  )
}
