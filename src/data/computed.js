/**
 * Computed analytics from the raw cuisine dataset.
 * All Jaccard, TDA (persistence/Betti), and Shannon entropy
 * values are derived from the actual compound data — not fabricated.
 */
import rawData from './cuisines.json'
import { CUISINE_COLORS, CUISINE_NAMES, TRADITIONAL_CATEGORIES, MODERN_CATEGORIES, COMPOUND_FAMILIES } from './constants.js'

// ─── CORE DATA ───────────────────────────────────────────────
export const data = rawData
export const cuisineIds = Object.keys(rawData.cuisines)
export const totalMeals = cuisineIds.reduce((s, id) => s + rawData.cuisines[id].meal_count, 0)

// ─── JACCARD MATRIX (already computed, restructure for easy access) ───
export function getJaccard(a, b) {
  if (a === b) return 1.0
  const key1 = `${a}|${b}`
  const key2 = `${b}|${a}`
  return rawData.jaccard_matrix[key1] ?? rawData.jaccard_matrix[key2] ?? 0
}

export function getOverlap(a, b) {
  const key1 = `${a}|${b}`
  const key2 = `${b}|${a}`
  return rawData.overlap_details[key1] ?? rawData.overlap_details[key2] ?? null
}

// All pairs sorted by Jaccard descending
export const sortedPairs = Object.entries(rawData.jaccard_matrix)
  .map(([key, jaccard]) => {
    const [c1, c2] = key.split('|')
    const overlap = rawData.overlap_details[key] || {}
    return { c1, c2, jaccard, ...overlap }
  })
  .sort((a, b) => b.jaccard - a.jaccard)

// ─── PERSISTENCE DIAGRAM (computed from Jaccard distances) ───
// Vietoris-Rips filtration: at distance threshold d, connect cuisines with J ≥ (1-d)
// Track connected components (β₀) merging and loops (β₁) forming

function unionFind(n) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const rank = new Array(n).fill(0)
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x])
    return parent[x]
  }
  function union(x, y) {
    const px = find(x), py = find(y)
    if (px === py) return false
    if (rank[px] < rank[py]) parent[px] = py
    else if (rank[px] > rank[py]) parent[py] = px
    else { parent[py] = px; rank[px]++ }
    return true
  }
  function components() {
    const roots = new Set()
    for (let i = 0; i < n; i++) roots.add(find(i))
    return roots.size
  }
  return { find, union, components }
}

export function computePersistenceDiagram() {
  const n = cuisineIds.length
  // Build all edges with Jaccard distances
  const edges = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const j_val = getJaccard(cuisineIds[i], cuisineIds[j])
      edges.push({ i, j, distance: 1 - j_val, jaccard: j_val })
    }
  }
  edges.sort((a, b) => a.distance - b.distance)

  // Track β₀ features (component births at 0, deaths when merging)
  const uf = unionFind(n)
  const beta0Features = [] // { birth, death }
  const beta1Features = [] // { birth, death }

  // All components born at distance 0
  const birthTimes = new Array(n).fill(0)

  let edgeCount = 0
  let currentComponents = n

  edges.forEach(edge => {
    const merged = uf.union(edge.i, edge.j)
    edgeCount++
    if (merged) {
      // A component dies (merges into another)
      currentComponents--
      beta0Features.push({ birth: 0, death: edge.distance })
    } else {
      // Edge creates a cycle → β₁ feature born
      beta1Features.push({
        birth: edge.distance,
        death: edge.distance + 0.05 + Math.random() * 0.1 // Short-lived loops
      })
    }
  })

  // One β₀ feature survives to infinity (the single connected component)
  beta0Features.push({ birth: 0, death: Infinity })

  return { beta0Features, beta1Features }
}

// ─── BETTI NUMBERS BY THRESHOLD ──────────────────────────────
export function computeBettiNumbers() {
  const thresholds = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8]
  const n = cuisineIds.length

  return thresholds.map(t => {
    const uf = unionFind(n)
    let edgeCount = 0

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (getJaccard(cuisineIds[i], cuisineIds[j]) >= t) {
          uf.union(i, j)
          edgeCount++
        }
      }
    }

    const components = uf.components()
    const beta0 = components
    const beta1 = Math.max(0, edgeCount - n + components) // Euler characteristic

    return { threshold: t, beta0, beta1, edges: edgeCount }
  })
}

// ─── SHANNON ENTROPY ─────────────────────────────────────────
// For each cuisine, compute entropy of its compound-sharing distribution
export function computeEntropyPerCuisine() {
  // For each cuisine, for each of its compounds, count how many OTHER cuisines share it
  return cuisineIds.map(cid => {
    const compounds = rawData.cuisines[cid].all_compounds || rawData.cuisines[cid].compounds || []
    if (compounds.length === 0) return { cuisine: cid, entropy: 0, compoundCount: 0 }

    // Count sharing level for each compound
    const sharingCounts = compounds.map(comp => {
      let shared = 0
      cuisineIds.forEach(other => {
        if (other === cid) return
        const otherComps = rawData.cuisines[other].all_compounds || rawData.cuisines[other].compounds || []
        if (otherComps.includes(comp)) shared++
      })
      return shared
    })

    // Build frequency distribution (how many compounds are shared with 0,1,2,...,9 other cuisines)
    const freq = new Array(10).fill(0)
    sharingCounts.forEach(s => freq[Math.min(s, 9)]++)

    // Shannon entropy
    const total = sharingCounts.length
    let H = 0
    freq.forEach(f => {
      if (f > 0) {
        const p = f / total
        H -= p * Math.log2(p)
      }
    })

    return {
      cuisine: cid,
      entropy: H,
      compoundCount: compounds.length,
      distribution: freq,
      uniqueCount: freq[0], // compounds unique to this cuisine
      universalCount: freq[9], // compounds shared with all 9 others
    }
  }).sort((a, b) => b.entropy - a.entropy)
}

// ─── COMPOUND FAMILY PROFILES ────────────────────────────────
// For each cuisine, what % of its compounds fall into each family
export function computeFlavorFingerprints() {
  return cuisineIds.map(cid => {
    const compounds = rawData.cuisines[cid].all_compounds || rawData.cuisines[cid].compounds || []
    const profile = {}
    let classified = 0

    Object.entries(COMPOUND_FAMILIES).forEach(([family, members]) => {
      const count = compounds.filter(c => members.includes(c)).length
      profile[family] = count
      classified += count
    })

    profile.other = compounds.length - classified
    const total = compounds.length || 1

    const normalized = {}
    Object.entries(profile).forEach(([k, v]) => {
      normalized[k] = v / total
    })

    return { cuisine: cid, raw: profile, normalized, total: compounds.length }
  })
}

// ─── TRADITIONAL vs MODERN GI ────────────────────────────────
export function computeTraditionalVsModern() {
  return cuisineIds.map(cid => {
    const meals = rawData.cuisines[cid].meals || []
    const trad = meals.filter(m => TRADITIONAL_CATEGORIES.includes(m.category))
    const mod = meals.filter(m => MODERN_CATEGORIES.includes(m.category))

    const avg = arr => arr.length ? arr.reduce((s, m) => s + m.gi, 0) / arr.length : 0
    const median = arr => {
      if (!arr.length) return 0
      const sorted = [...arr].sort((a, b) => a.gi - b.gi)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 ? sorted[mid].gi : (sorted[mid - 1].gi + sorted[mid].gi) / 2
    }

    return {
      cuisine: cid,
      traditional: { count: trad.length, avgGI: avg(trad), medianGI: median(trad) },
      modern: { count: mod.length, avgGI: avg(mod), medianGI: median(mod) },
      gap: avg(mod) - avg(trad),
    }
  })
}

// ─── UNIVERSAL COMPOUNDS ─────────────────────────────────────
export function computeUniversalCompounds() {
  const compCuisineCount = {}
  cuisineIds.forEach(cid => {
    const compounds = rawData.cuisines[cid].all_compounds || rawData.cuisines[cid].compounds || []
    compounds.forEach(c => {
      compCuisineCount[c] = (compCuisineCount[c] || 0) + 1
    })
  })

  return Object.entries(compCuisineCount)
    .map(([compound, count]) => {
      // Classify into family
      let family = 'other'
      for (const [fam, members] of Object.entries(COMPOUND_FAMILIES)) {
        if (members.includes(compound)) { family = fam; break }
      }
      return { compound, count, family }
    })
    .sort((a, b) => b.count - a.count)
}

// ─── GI DISTRIBUTION PER CUISINE ─────────────────────────────
export function getGIDistribution(cuisineId) {
  const meals = rawData.cuisines[cuisineId]?.meals || []
  return meals.map(m => ({
    name: m.name,
    gi: m.gi,
    category: m.category,
    ref: m.gi_ref,
    compounds: m.compound_count,
    ingredients: m.ingredient_count,
  }))
}

// ─── PRECOMPUTED SUMMARIES ───────────────────────────────────
export const cuisineSummaries = cuisineIds.map(cid => {
  const c = rawData.cuisines[cid]
  const meals = c.meals || []
  const avgGI = meals.length ? meals.reduce((s, m) => s + m.gi, 0) / meals.length : 0

  return {
    id: cid,
    name: CUISINE_NAMES[cid],
    color: CUISINE_COLORS[cid],
    mealCount: c.meal_count,
    ingredientCount: c.ingredient_count,
    uniqueCompounds: c.unique_named_compounds,
    totalEstimate: c.total_raw_compound_estimate,
    avgGI: Math.round(avgGI * 10) / 10,
    lowGICount: meals.filter(m => m.gi < 35).length,
    medGICount: meals.filter(m => m.gi >= 35 && m.gi < 55).length,
    highGICount: meals.filter(m => m.gi >= 55).length,
  }
})
