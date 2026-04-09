import React, { useState, useMemo } from 'react'
import ScrollSection from '../components/ScrollSection'
import { data, cuisineIds } from '../data/computed'
import { CUISINE_NAMES, CUISINE_COLORS, CATEGORY_LABELS, GI_ZONES } from '../data/constants'

/**
 * "Build Your Plate" — interactive meal planner.
 * Users select a cuisine, browse meals, add them to a virtual plate,
 * and see combined GI estimate, compound diversity, and meal balance.
 */
export default function PlatePlanner() {
  const [cuisine, setCuisine] = useState('indian')
  const [plate, setPlate] = useState([]) // array of meal objects
  const [category, setCategory] = useState('all')

  const meals = useMemo(() => {
    const c = data.cuisines[cuisine]
    if (!c) return []
    let m = c.meals || []
    if (category !== 'all') m = m.filter(x => x.category === category)
    return m.sort((a, b) => a.gi - b.gi)
  }, [cuisine, category])

  const categories = useMemo(() => {
    const cats = new Set()
    const c = data.cuisines[cuisine]
    if (c) c.meals?.forEach(m => { if (m.category) cats.add(m.category) })
    return ['all', ...Array.from(cats).sort()]
  }, [cuisine])

  // Plate analytics
  const plateStats = useMemo(() => {
    if (plate.length === 0) return null

    const avgGI = plate.reduce((s, m) => s + m.gi, 0) / plate.length
    const allCompounds = new Set()
    const allIngredients = new Set()
    plate.forEach(m => {
      m.compounds?.forEach(c => allCompounds.add(c))
      m.ingredients?.forEach(i => allIngredients.add(i))
    })

    // Category balance
    const catCounts = {}
    plate.forEach(m => {
      const cat = m.category || 'other'
      catCounts[cat] = (catCounts[cat] || 0) + 1
    })

    // GI zone
    let zone, zoneColor
    if (avgGI < 35) { zone = 'Low'; zoneColor = '#10b981' }
    else if (avgGI < 55) { zone = 'Medium'; zoneColor = '#f59e0b' }
    else if (avgGI < 70) { zone = 'High'; zoneColor = '#f97316' }
    else { zone = 'Very High'; zoneColor = '#ef4444' }

    return {
      avgGI: Math.round(avgGI * 10) / 10,
      zone, zoneColor,
      compoundDiversity: allCompounds.size,
      ingredientCount: allIngredients.size,
      catCounts,
      mealCount: plate.length,
    }
  }, [plate])

  const addToPlate = (meal) => {
    if (plate.length >= 6) return // max 6 items
    if (plate.some(m => m.name === meal.name)) return // no duplicates
    setPlate([...plate, meal])
  }

  const removeFromPlate = (index) => {
    setPlate(plate.filter((_, i) => i !== index))
  }

  const clearPlate = () => setPlate([])

  const getGIColor = (gi) => {
    if (gi < 35) return '#10b981'
    if (gi < 55) return '#f59e0b'
    if (gi < 70) return '#f97316'
    return '#ef4444'
  }

  return (
    <ScrollSection id="plate" title="Build Your Plate">
      <p className="text-sm text-slate-400 mb-8 max-w-2xl">
        Choose a cuisine, browse foods, and build a culturally authentic plate.
        See your combined glycemic impact and flavor compound diversity in real time.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Cuisine selector + meal list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cuisine pills */}
          <div className="flex flex-wrap gap-2">
            {cuisineIds.map(id => (
              <button
                key={id}
                onClick={() => { setCuisine(id); setPlate([]); setCategory('all') }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  cuisine === id
                    ? 'text-[#0a0a0f] font-semibold'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                }`}
                style={cuisine === id ? { backgroundColor: CUISINE_COLORS[id] } : {}}
              >
                {CUISINE_NAMES[id]}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  category === cat
                    ? 'bg-[#d4a574]/20 text-[#d4a574] border border-[#d4a574]/30'
                    : 'bg-slate-800/30 text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          {/* Meal grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-1">
            {meals.map((meal, idx) => {
              const onPlate = plate.some(m => m.name === meal.name)
              return (
                <button
                  key={idx}
                  onClick={() => !onPlate && addToPlate(meal)}
                  disabled={onPlate || plate.length >= 6}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    onPlate
                      ? 'border-[#d4a574]/50 bg-[#d4a574]/10 opacity-60'
                      : plate.length >= 6
                      ? 'border-slate-700/30 bg-slate-800/20 opacity-40 cursor-not-allowed'
                      : 'border-slate-700/30 bg-slate-800/30 hover:border-[#d4a574]/30 hover:bg-slate-800/60 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-200 truncate pr-2">{meal.name}</span>
                    <span
                      className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-mono text-white"
                      style={{ backgroundColor: getGIColor(meal.gi) }}
                    >
                      {meal.gi}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {CATEGORY_LABELS[meal.category] || meal.category}
                    {meal.compound_count ? ` · ${meal.compound_count} compounds` : ''}
                  </div>
                  {onPlate && <div className="text-xs text-[#d4a574] mt-1">On your plate</div>}
                </button>
              )
            })}
          </div>
        </div>

        {/* RIGHT: The Plate */}
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-200">Your Plate</h3>
              {plate.length > 0 && (
                <button
                  onClick={clearPlate}
                  className="text-xs text-slate-500 hover:text-red-400 transition"
                >
                  Clear
                </button>
              )}
            </div>

            {plate.length === 0 && (
              <div className="text-center py-8">
                <div className="text-3xl mb-2 opacity-30">🍽</div>
                <p className="text-sm text-slate-500">Click meals to add them</p>
                <p className="text-xs text-slate-600 mt-1">Up to 6 items</p>
              </div>
            )}

            {/* Plate items */}
            <div className="space-y-2 mb-4">
              {plate.map((meal, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-200 truncate">{meal.name}</div>
                    <div className="text-xs text-slate-500">{CATEGORY_LABELS[meal.category] || meal.category}</div>
                  </div>
                  <span
                    className="flex-shrink-0 ml-2 px-1.5 py-0.5 rounded text-xs font-mono text-white"
                    style={{ backgroundColor: getGIColor(meal.gi) }}
                  >
                    {meal.gi}
                  </span>
                  <button
                    onClick={() => removeFromPlate(idx)}
                    className="flex-shrink-0 ml-2 w-5 h-5 rounded-full bg-slate-700/50 text-slate-400 hover:text-red-400 hover:bg-red-900/30 transition text-xs flex items-center justify-center"
                    aria-label={`Remove ${meal.name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {/* Plate stats */}
            {plateStats && (
              <div className="border-t border-slate-700/30 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Average GI</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-sm font-bold text-white"
                      style={{ backgroundColor: plateStats.zoneColor }}
                    >
                      {plateStats.avgGI}
                    </span>
                    <span className="text-xs" style={{ color: plateStats.zoneColor }}>
                      {plateStats.zone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Compound diversity</span>
                  <span className="text-sm font-semibold text-[#d4a574]">{plateStats.compoundDiversity}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Unique ingredients</span>
                  <span className="text-sm text-slate-300">{plateStats.ingredientCount}</span>
                </div>

                {/* Category balance bar */}
                <div>
                  <div className="text-xs text-slate-500 mb-1.5">Category balance</div>
                  <div className="flex rounded-full overflow-hidden h-2">
                    {Object.entries(plateStats.catCounts).map(([cat, count]) => {
                      const pct = (count / plateStats.mealCount) * 100
                      const colors = {
                        protein: '#3b82f6', legume: '#22c55e', vegetable: '#10b981',
                        cereal_low: '#84cc16', soup: '#06b6d4', fermented: '#a855f7',
                        dairy: '#f0abfc', cereal_high: '#f97316', dessert: '#ef4444',
                        fried: '#dc2626', snack: '#f59e0b', salad: '#34d399',
                        fruit: '#fb923c', mixed: '#6b7280',
                      }
                      return (
                        <div
                          key={cat}
                          style={{ width: `${pct}%`, backgroundColor: colors[cat] || '#64748b' }}
                          title={`${CATEGORY_LABELS[cat] || cat}: ${count}`}
                        />
                      )
                    })}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                    {Object.entries(plateStats.catCounts).map(([cat, count]) => (
                      <span key={cat} className="text-xs text-slate-500">
                        {CATEGORY_LABELS[cat] || cat}: {count}
                      </span>
                    ))}
                  </div>
                </div>

                {/* GI observation (NOT medical advice) */}
                <div className={`text-xs rounded-lg p-3 ${
                  plateStats.avgGI < 45
                    ? 'bg-green-900/20 border border-green-800/30 text-green-300'
                    : plateStats.avgGI < 60
                    ? 'bg-amber-900/20 border border-amber-800/30 text-amber-300'
                    : 'bg-red-900/20 border border-red-800/30 text-red-300'
                }`}>
                  {plateStats.avgGI < 45
                    ? 'This plate features mostly low-GI traditional foods. These tend to provide sustained energy release.'
                    : plateStats.avgGI < 60
                    ? 'Moderate average GI. Swapping a refined grain for a legume or vegetable dish would lower the overall GI.'
                    : 'Higher average GI, driven by refined grains or sugar-dense items. Traditional whole-food alternatives from this cuisine would lower it.'
                  }
                </div>

                {/* Medical disclaimer */}
                <div className="text-xs text-slate-600 bg-slate-800/30 rounded p-2 mt-2 border border-slate-700/30">
                  <strong className="text-slate-500">Educational tool only.</strong> GI is a population average that
                  does not account for portion size, food combining, cooking method, or individual metabolism.
                  {plateStats.mealCount > 0 && (
                    <span className="text-amber-600 ml-1">
                      Note: most GI values in this dataset are category-based estimates, not laboratory measurements.
                    </span>
                  )}
                  {' '}Consult a registered dietitian for personalized nutrition guidance.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollSection>
  )
}
