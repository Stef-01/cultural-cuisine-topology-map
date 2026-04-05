import React, { useState, useMemo } from 'react'
import ScrollSection from '../components/ScrollSection'
import BeeswarmChart from '../viz/BeeswarmChart'
import { data, getGIDistribution, cuisineIds } from '../data/computed'
import { CUISINE_COLORS, CUISINE_NAMES, CATEGORY_LABELS, GI_ZONES } from '../data/constants'
import useStore from '../store'

export default function ClinicalTool() {
  const { clinicalCuisine, setClinicalCuisine, clinicalCategory, setClinicalCategory } = useStore()
  const [activeCuisine, setActiveCuisine] = useState(clinicalCuisine || 'indian')
  const [activeCategory, setActiveCategory] = useState(clinicalCategory || 'all')

  // Get available categories
  const categories = useMemo(() => {
    const cats = new Set()
    Object.values(data.cuisines).forEach(cuisine => {
      cuisine.meals?.forEach(meal => {
        if (meal.category) cats.add(meal.category)
      })
    })
    return ['all', ...Array.from(cats).sort()]
  }, [])

  // Get meals for active cuisine and category
  const filteredMeals = useMemo(() => {
    const cuisine = data.cuisines[activeCuisine]
    if (!cuisine) return []

    let meals = cuisine.meals || []

    if (activeCategory !== 'all') {
      meals = meals.filter(m => m.category === activeCategory)
    }

    return meals.sort((a, b) => (a.gi || 100) - (b.gi || 100))
  }, [activeCuisine, activeCategory])

  // Count meals in each GI zone
  const giStats = useMemo(() => {
    const zones = { low: 0, medium: 0, high: 0, veryHigh: 0 }
    filteredMeals.forEach(meal => {
      const gi = meal.gi || 100
      if (gi < 35) zones.low++
      else if (gi < 55) zones.medium++
      else if (gi < 70) zones.high++
      else zones.veryHigh++
    })
    return zones
  }, [filteredMeals])

  const getGIZoneColor = (gi) => {
    if (gi < 35) return '#10b981' // green
    if (gi < 55) return '#f59e0b' // amber
    if (gi < 70) return '#f97316' // orange
    return '#ef4444' // red
  }

  const getGIZoneLabel = (gi) => {
    if (gi < 35) return 'Low'
    if (gi < 55) return 'Medium'
    if (gi < 70) return 'High'
    return 'Very High'
  }

  const handleCuisineChange = (cid) => {
    setActiveCuisine(cid)
    setClinicalCuisine(cid)
  }

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setClinicalCategory(cat)
  }

  return (
    <ScrollSection id="clinical" title="Your Culture's Best Low-GI Foods">
      {/* Cuisine Selector */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Select Cuisine</h3>
        <div className="grid grid-cols-5 gap-4">
          {cuisineIds.slice(0, 10).map(cid => {
            const cuisine = data.cuisines[cid]
            const mealCount = cuisine?.meals?.length || 0
            const isActive = activeCuisine === cid
            return (
              <button
                key={cid}
                onClick={() => handleCuisineChange(cid)}
                className={`p-4 rounded-lg border-2 transition ${
                  isActive
                    ? 'border-[#d4a574] bg-[#d4a574]/10'
                    : 'border-slate-700/50 hover:border-slate-600/50 bg-slate-800/50'
                }`}
              >
                <div
                  className="w-full h-3 rounded mb-2"
                  style={{ backgroundColor: CUISINE_COLORS[cid] || '#cbd5e1' }}
                />
                <div className={`font-semibold text-sm ${isActive ? 'text-[#d4a574]' : 'text-slate-200'}`}>
                  {CUISINE_NAMES[cid] || cid}
                </div>
                <div className="text-xs text-slate-400">{mealCount} meals</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Filter by Category</h3>
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-[#d4a574] text-[#0a0a0f]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Categories' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* GI Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-400">{giStats.low}</div>
          <div className="text-xs text-green-300/80 mt-1">Low GI (&lt;35)</div>
        </div>
        <div className="bg-amber-900/20 rounded-lg p-4 border-l-4 border-amber-500">
          <div className="text-2xl font-bold text-amber-400">{giStats.medium}</div>
          <div className="text-xs text-amber-300/80 mt-1">Medium (35-55)</div>
        </div>
        <div className="bg-orange-900/20 rounded-lg p-4 border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-orange-400">{giStats.high}</div>
          <div className="text-xs text-orange-300/80 mt-1">High (55-70)</div>
        </div>
        <div className="bg-red-900/20 rounded-lg p-4 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-400">{giStats.veryHigh}</div>
          <div className="text-xs text-red-300/80 mt-1">Very High (&gt;70)</div>
        </div>
      </div>

      {/* Beeswarm Chart */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 mb-8">
        <BeeswarmChart cuisineId={activeCuisine} />
      </div>

      {/* Meal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeals.map((meal, idx) => {
          const gi = meal.gi || 100
          const giZoneColor = getGIZoneColor(gi)
          const giZoneLabel = getGIZoneLabel(gi)
          const compoundCount = meal.compounds?.length || 0
          const ingredientCount = meal.ingredients?.length || 0

          return (
            <div
              key={idx}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 border-l-4"
              style={{ borderLeftColor: giZoneColor }}
            >
              <h4 className="font-semibold text-sm mb-2 text-slate-200">{meal.name}</h4>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-2 py-1 rounded text-white text-xs font-medium"
                  style={{ backgroundColor: giZoneColor }}
                >
                  GI {gi}
                </span>
                <span className="text-xs text-slate-400">{giZoneLabel}</span>
              </div>
              {meal.category && (
                <div className="text-xs text-slate-400 mb-2">
                  {CATEGORY_LABELS[meal.category] || meal.category}
                </div>
              )}
              <div className="text-xs text-slate-500 flex gap-3 mb-2">
                <span>{compoundCount} compounds</span>
                <span>{ingredientCount} ingredients</span>
              </div>
              {meal.giReference && (
                <div className="text-xs italic text-slate-500">{meal.giReference}</div>
              )}
            </div>
          )
        })}
      </div>
    </ScrollSection>
  )
}
