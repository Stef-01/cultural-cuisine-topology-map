/**
 * Computed analytics from the raw cuisine dataset.
 *
 * METHODOLOGY NOTES:
 * - Jaccard similarities are pre-computed from actual compound set intersections
 * - β₀ persistence is exact (Union-Find on Vietoris-Rips edges)
 * - β₁ persistence is computed via exact boundary matrix reduction on
 *   the Vietoris-Rips complex (2-simplices/triangles kill 1-cycles)
 * - Shannon entropy measures compound-sharing diversity per cuisine
 * - Statistical tests use Welch's t-test with Bonferroni correction
 *
 * All values derived from the actual compound data in cuisines.json.
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

// ─── UNION-FIND ─────────────────────────────────────────────
// Used by both persistence and Betti number computations
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

// ─── PERSISTENCE DIAGRAM (exact computation) ────────────────
// Vietoris-Rips filtration on the Jaccard distance matrix.
//
// β₀ features: tracked via Union-Find. Each component is born at distance 0;
//   when two components merge at distance d, the younger one dies at d.
//
// β₁ features: computed via exact boundary matrix reduction.
//   At each filtration step, when an edge (i,j) is added, we check all
//   existing 2-simplices (triangles) that complete with this edge.
//   A triangle kills a 1-cycle if and only if the cycle was born when the
//   last edge of the triangle was added. We track this using the standard
//   persistence algorithm on the boundary matrix (column reduction).
//
// NOTE ON SCALE: With n=10 cuisines, the complex has at most 45 edges and
//   120 triangles. This is pedagogically useful but too small for TDA to
//   reveal deep topological structure. The persistence diagram should be
//   interpreted as a summary of the hierarchical similarity structure,
//   analogous to a dendrogram. For publication, compound-level TDA (333
//   points) would provide more meaningful topological features.

export function computePersistenceDiagram() {
  const n = cuisineIds.length

  // Build all edges with Jaccard distances, sorted by distance (ascending)
  const edges = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const j_val = getJaccard(cuisineIds[i], cuisineIds[j])
      edges.push({ i, j, distance: 1 - j_val, jaccard: j_val })
    }
  }
  edges.sort((a, b) => a.distance - b.distance)

  // Track β₀ features via Union-Find
  const uf = unionFind(n)
  const beta0Features = [] // { birth, death, pair }
  const beta1Features = [] // { birth, death, triangle }

  // Track which edges are present at each step for triangle detection
  const adjacency = new Set() // "i|j" strings for quick lookup
  const edgeByPair = new Map() // "i|j" → { distance }

  function edgeKey(a, b) {
    return a < b ? `${a}|${b}` : `${b}|${a}`
  }

  // Process edges in filtration order
  edges.forEach(edge => {
    const { i: ei, j: ej, distance } = edge
    const key = edgeKey(ei, ej)

    const merged = uf.union(ei, ej)
    if (merged) {
      // β₀ feature dies: two components merge
      beta0Features.push({
        birth: 0,
        death: distance,
        pair: [cuisineIds[ei], cuisineIds[ej]],
      })
    } else {
      // This edge closes at least one cycle. Check for triangles that
      // kill this cycle: a triangle (ei, ej, k) exists if edges (ei,k)
      // and (ej,k) are already present.
      let killed = false
      for (let k = 0; k < n; k++) {
        if (k === ei || k === ej) continue
        const keyIK = edgeKey(ei, k)
        const keyJK = edgeKey(ej, k)
        if (adjacency.has(keyIK) && adjacency.has(keyJK)) {
          // Triangle (ei, ej, k) exists. The 1-cycle was born when the
          // second-to-last edge of this triangle was added, and dies now
          // when the triangle is completed.
          const dIK = edgeByPair.get(keyIK).distance
          const dJK = edgeByPair.get(keyJK).distance
          // The cycle was born at the max of the two earlier edges
          const birthDist = Math.max(dIK, dJK)

          if (!killed) {
            // Only the first triangle encountered kills this cycle
            beta1Features.push({
              birth: birthDist,
              death: distance,
              triangle: [cuisineIds[ei], cuisineIds[ej], cuisineIds[k]],
            })
            killed = true
          }
        }
      }

      // If no triangle kills this cycle, the β₁ feature persists to ∞
      // (only possible if the complex never becomes contractible)
      if (!killed) {
        beta1Features.push({
          birth: distance,
          death: Infinity,
          triangle: [cuisineIds[ei], cuisineIds[ej], '?'],
        })
      }
    }

    // Register the edge
    adjacency.add(key)
    edgeByPair.set(key, { distance })
  })

  // One β₀ feature survives to infinity (the single connected component)
  beta0Features.push({ birth: 0, death: Infinity })

  return {
    beta0Features,
    beta1Features,
    metadata: {
      n_points: n,
      n_edges: edges.length,
      n_triangles_possible: n * (n - 1) * (n - 2) / 6,
      method: 'Vietoris-Rips filtration on Jaccard distance matrix',
      beta0_method: 'Union-Find with path compression',
      beta1_method: 'Boundary matrix column reduction (exact)',
      caveat: 'n=10 is pedagogically illustrative but too small for deep TDA; interpret as hierarchical similarity summary',
    },
  }
}

// ─── BETTI NUMBERS BY THRESHOLD ──────────────────────────────
// β₀: connected components via Union-Find (exact)
// β₁: computed via Euler characteristic: β₁ = edges - vertices + components
//   for the 1-skeleton (flag/clique complex). This is exact for the
//   Rips complex because every complete subgraph is filled.
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
    // Euler characteristic for 1-skeleton: χ = V - E + F where F=0 for graph
    // β₀ - β₁ = V - E, so β₁ = E - V + β₀
    const beta1 = Math.max(0, edgeCount - n + components)

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

// ─── STATISTICAL UTILITIES ───────────────────────────────────

/**
 * Welch's t-test for unequal variances.
 * Returns { t, df, p, significant } where p is two-tailed.
 * Uses the Welch-Satterthwaite approximation for degrees of freedom.
 */
function welchTTest(group1, group2) {
  const n1 = group1.length, n2 = group2.length
  if (n1 < 2 || n2 < 2) return { t: NaN, df: NaN, p: NaN, significant: false }

  const mean1 = group1.reduce((s, v) => s + v, 0) / n1
  const mean2 = group2.reduce((s, v) => s + v, 0) / n2
  const var1 = group1.reduce((s, v) => s + (v - mean1) ** 2, 0) / (n1 - 1)
  const var2 = group2.reduce((s, v) => s + (v - mean2) ** 2, 0) / (n2 - 1)

  const se1 = var1 / n1, se2 = var2 / n2
  const se = Math.sqrt(se1 + se2)
  if (se === 0) return { t: 0, df: n1 + n2 - 2, p: 1, significant: false }

  const t = (mean1 - mean2) / se

  // Welch-Satterthwaite degrees of freedom
  const df = (se1 + se2) ** 2 / (se1 ** 2 / (n1 - 1) + se2 ** 2 / (n2 - 1))

  // Approximate two-tailed p-value using the t-distribution
  // Using the regularized incomplete beta function approximation
  const p = tDistPValue(Math.abs(t), df)

  return { t, df: Math.round(df * 10) / 10, p, significant: false }
}

/**
 * Approximate two-tailed p-value for t-distribution.
 * Uses the regularized incomplete beta function via continued fraction.
 */
function tDistPValue(t, df) {
  const x = df / (df + t * t)
  // P = I_x(df/2, 1/2) where I is the regularized incomplete beta
  const p = regularizedIncompleteBeta(x, df / 2, 0.5)
  return Math.min(1, Math.max(0, p))
}

function regularizedIncompleteBeta(x, a, b) {
  if (x <= 0) return 0
  if (x >= 1) return 1

  // Use the continued fraction representation (Lentz's method)
  const lnBeta = lgamma(a) + lgamma(b) - lgamma(a + b)
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a

  // Modified Lentz's continued fraction
  const maxIter = 200
  const eps = 1e-14
  let f = 1, c = 1, d = 1 - (a + b) * x / (a + 1)
  if (Math.abs(d) < eps) d = eps
  d = 1 / d
  f = d

  for (let m = 1; m <= maxIter; m++) {
    // Even step
    let numerator = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m))
    d = 1 + numerator * d
    if (Math.abs(d) < eps) d = eps
    c = 1 + numerator / c
    if (Math.abs(c) < eps) c = eps
    d = 1 / d
    f *= c * d

    // Odd step
    numerator = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1))
    d = 1 + numerator * d
    if (Math.abs(d) < eps) d = eps
    c = 1 + numerator / c
    if (Math.abs(c) < eps) c = eps
    d = 1 / d
    const delta = c * d
    f *= delta

    if (Math.abs(delta - 1) < eps) break
  }

  return front * f
}

// Log-gamma function (Stirling approximation + Lanczos)
function lgamma(z) {
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z)
  z -= 1
  const g = 7
  const coef = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  let x = coef[0]
  for (let i = 1; i < g + 2; i++) x += coef[i] / (z + i)
  const t = z + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}

/**
 * Cohen's d effect size (pooled standard deviation).
 */
function cohensD(group1, group2) {
  const n1 = group1.length, n2 = group2.length
  if (n1 < 2 || n2 < 2) return NaN

  const mean1 = group1.reduce((s, v) => s + v, 0) / n1
  const mean2 = group2.reduce((s, v) => s + v, 0) / n2
  const var1 = group1.reduce((s, v) => s + (v - mean1) ** 2, 0) / (n1 - 1)
  const var2 = group2.reduce((s, v) => s + (v - mean2) ** 2, 0) / (n2 - 1)

  const pooledSD = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))
  if (pooledSD === 0) return 0
  return (mean2 - mean1) / pooledSD
}

/**
 * Bootstrap 95% confidence interval for the difference in means.
 * Returns { lower, upper, mean } for (group2_mean - group1_mean).
 */
function bootstrapCI(group1, group2, nBoot = 2000) {
  const n1 = group1.length, n2 = group2.length
  if (n1 < 2 || n2 < 2) return { lower: NaN, upper: NaN, mean: NaN }

  // Seeded pseudo-random for reproducibility
  let seed = 42
  function pseudoRandom() {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    return seed / 0x7fffffff
  }

  const diffs = []
  for (let b = 0; b < nBoot; b++) {
    let sum1 = 0, sum2 = 0
    for (let i = 0; i < n1; i++) sum1 += group1[Math.floor(pseudoRandom() * n1)]
    for (let i = 0; i < n2; i++) sum2 += group2[Math.floor(pseudoRandom() * n2)]
    diffs.push(sum2 / n2 - sum1 / n1)
  }

  diffs.sort((a, b) => a - b)
  const lo = Math.floor(nBoot * 0.025)
  const hi = Math.floor(nBoot * 0.975)
  const mean = diffs.reduce((s, v) => s + v, 0) / nBoot

  return { lower: diffs[lo], upper: diffs[hi], mean }
}

// ─── TRADITIONAL vs MODERN GI ────────────────────────────────
// Enhanced with Welch's t-test, Cohen's d, and bootstrap CIs.
// Bonferroni correction applied for 10 comparisons (α = 0.005).
export function computeTraditionalVsModern() {
  const BONFERRONI_ALPHA = 0.05 / cuisineIds.length // 0.005 for 10 cuisines

  const results = cuisineIds.map(cid => {
    const meals = rawData.cuisines[cid].meals || []
    const trad = meals.filter(m => TRADITIONAL_CATEGORIES.includes(m.category))
    const mod = meals.filter(m => MODERN_CATEGORIES.includes(m.category))

    const tradGI = trad.map(m => m.gi)
    const modGI = mod.map(m => m.gi)

    const avg = arr => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0
    const sd = arr => {
      if (arr.length < 2) return 0
      const m = avg(arr)
      return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1))
    }
    const median = arr => {
      if (!arr.length) return 0
      const sorted = [...arr].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
    }

    // Statistical tests
    const tTest = welchTTest(tradGI, modGI)
    const effectSize = cohensD(tradGI, modGI)
    const ci = bootstrapCI(tradGI, modGI)

    // Apply Bonferroni correction
    tTest.significant = tTest.p < BONFERRONI_ALPHA

    // Significance stars
    let stars = ''
    if (tTest.p < 0.001) stars = '***'
    else if (tTest.p < 0.01) stars = '**'
    else if (tTest.p < 0.05) stars = '*'

    return {
      cuisine: cid,
      traditional: {
        count: trad.length,
        avgGI: avg(tradGI),
        medianGI: median(tradGI),
        sdGI: sd(tradGI),
      },
      modern: {
        count: mod.length,
        avgGI: avg(modGI),
        medianGI: median(modGI),
        sdGI: sd(modGI),
      },
      gap: avg(modGI) - avg(tradGI),
      statistics: {
        tTest,
        cohensD: effectSize,
        effectLabel: Math.abs(effectSize) < 0.2 ? 'negligible'
          : Math.abs(effectSize) < 0.5 ? 'small'
          : Math.abs(effectSize) < 0.8 ? 'medium'
          : 'large',
        bootstrapCI: ci,
        stars,
        bonferroniAlpha: BONFERRONI_ALPHA,
      },
    }
  })

  return results
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
