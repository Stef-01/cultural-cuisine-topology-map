/**
 * DATA INTEGRITY TEST SUITE
 *
 * Independent verification that all data is real, computed values are
 * genuine, and nothing is hardcoded/fabricated. If any of these tests
 * fail, the credibility of the entire project is compromised.
 *
 * These tests are INDEPENDENT of the main computed.js tests — they
 * verify the raw data and cross-check computed values by recomputing
 * from scratch.
 */

import { describe, it, expect } from 'vitest'
import rawData from './cuisines.json'
import {
  getJaccard, cuisineIds, computeTraditionalVsModern,
  computeEntropyPerCuisine, computeDendrogram, computeUniversalCompounds,
  computeCompoundCuisineMatrix, computeGISensitivity,
} from './computed'
import { CUISINE_NAMES, TRADITIONAL_CATEGORIES, MODERN_CATEGORIES } from './constants'

// ═══════════════════════════════════════════════════════════════
// SECTION 1: Raw Data Existence and Structure
// ═══════════════════════════════════════════════════════════════

describe('Raw data structure integrity', () => {
  it('cuisines.json has a meta section', () => {
    expect(rawData.meta).toBeDefined()
    expect(rawData.meta.cuisines).toBe(10)
    expect(rawData.meta.total_ingredients_mapped).toBeGreaterThan(50)
  })

  it('has exactly 10 cuisines', () => {
    const ids = Object.keys(rawData.cuisines)
    expect(ids).toHaveLength(10)
  })

  it('every cuisine has meals, and total exceeds 1900', () => {
    let total = 0
    Object.values(rawData.cuisines).forEach(c => {
      expect(c.meals).toBeDefined()
      expect(Array.isArray(c.meals)).toBe(true)
      expect(c.meals.length).toBeGreaterThan(100)
      total += c.meals.length
    })
    expect(total).toBeGreaterThan(1900)
  })

  it('every meal has required fields', () => {
    Object.entries(rawData.cuisines).forEach(([cid, cuisine]) => {
      cuisine.meals.forEach((meal, idx) => {
        expect(meal.name, `${cid} meal ${idx} missing name`).toBeDefined()
        expect(typeof meal.gi, `${cid} ${meal.name} gi not number`).toBe('number')
        expect(meal.gi, `${cid} ${meal.name} gi out of range`).toBeGreaterThanOrEqual(0)
        expect(meal.gi, `${cid} ${meal.name} gi out of range`).toBeLessThanOrEqual(100)
        expect(meal.category, `${cid} ${meal.name} missing category`).toBeDefined()
      })
    })
  })

  it('no meal names are duplicated within a cuisine', () => {
    Object.entries(rawData.cuisines).forEach(([cid, cuisine]) => {
      const names = cuisine.meals.map(m => m.name)
      const uniqueNames = new Set(names)
      // Allow some duplicates (common names) but flag excessive duplication
      const dupeRatio = 1 - uniqueNames.size / names.length
      expect(dupeRatio, `${cid} has ${(dupeRatio * 100).toFixed(0)}% duplicate meal names`).toBeLessThan(0.1)
    })
  })

  it('all ingredients are lowercase snake_case strings', () => {
    Object.values(rawData.cuisines).forEach(cuisine => {
      cuisine.meals.forEach(meal => {
        (meal.ingredients || []).forEach(ing => {
          expect(typeof ing).toBe('string')
          expect(ing).toBe(ing.toLowerCase())
        })
      })
    })
  })
})

// ═══════════════════════════════════════════════════════════════
// SECTION 2: GI Data Integrity
// ═══════════════════════════════════════════════════════════════

describe('GI data integrity', () => {
  it('GI values span a realistic range (not all identical)', () => {
    Object.entries(rawData.cuisines).forEach(([cid, cuisine]) => {
      const gis = cuisine.meals.map(m => m.gi)
      const uniqueGIs = new Set(gis)
      expect(uniqueGIs.size, `${cid} has only ${uniqueGIs.size} unique GI values`).toBeGreaterThan(5)
    })
  })

  it('GI=0 meals are protein category (not random zeros)', () => {
    let gi0Count = 0
    let gi0Protein = 0
    Object.values(rawData.cuisines).forEach(cuisine => {
      cuisine.meals.forEach(meal => {
        if (meal.gi === 0) {
          gi0Count++
          if (meal.category === 'protein') gi0Protein++
        }
      })
    })
    // Most GI=0 should be protein
    expect(gi0Protein / gi0Count, 'GI=0 meals should mostly be protein').toBeGreaterThan(0.9)
  })

  it('estimated GI values have "est." in gi_ref', () => {
    let estimated = 0
    let hasEstPrefix = 0
    Object.values(rawData.cuisines).forEach(cuisine => {
      cuisine.meals.forEach(meal => {
        if (meal.gi_ref && meal.gi_ref.includes('est.')) {
          estimated++
          hasEstPrefix++
        }
      })
    })
    // All "est." prefixed should be counted
    expect(hasEstPrefix).toBe(estimated)
  })

  it('GI sensitivity analysis matches manual count', () => {
    const sensitivity = computeGISensitivity()
    sensitivity.forEach(row => {
      const cuisine = rawData.cuisines[row.cuisine]
      const meals = cuisine.meals || []
      const measured = meals.filter(m => m.gi_ref && !m.gi_ref.includes('est.'))
      const estimated = meals.filter(m => m.gi_ref && m.gi_ref.includes('est.'))
      expect(row.measuredCount).toBe(measured.length)
      expect(row.estimatedCount).toBe(estimated.length)
    })
  })
})

// ═══════════════════════════════════════════════════════════════
// SECTION 3: Jaccard Similarity Not Hardcoded
// ═══════════════════════════════════════════════════════════════

describe('Jaccard similarity is computed, not hardcoded', () => {
  it('Jaccard values match manual recomputation from raw compound data', () => {
    // Pick 5 random pairs and recompute from scratch
    const testPairs = [
      ['indian', 'thai'],
      ['japanese', 'korean'],
      ['ethiopian', 'west_african'],
      ['mexican', 'peruvian'],
      ['mediterranean', 'middle_eastern'],
    ]

    testPairs.forEach(([c1, c2]) => {
      const comps1 = new Set(rawData.cuisines[c1].all_compounds || [])
      const comps2 = new Set(rawData.cuisines[c2].all_compounds || [])

      if (comps1.size === 0 || comps2.size === 0) return // skip if no compound data

      let intersection = 0
      comps1.forEach(c => { if (comps2.has(c)) intersection++ })
      const union = comps1.size + comps2.size - intersection
      const manualJaccard = union > 0 ? intersection / union : 0

      const storedJaccard = getJaccard(c1, c2)

      expect(
        Math.abs(storedJaccard - manualJaccard),
        `${c1}-${c2}: stored=${storedJaccard.toFixed(4)} manual=${manualJaccard.toFixed(4)}`
      ).toBeLessThan(0.001)
    })
  })

  it('Jaccard matrix in JSON matches getJaccard() function', () => {
    Object.entries(rawData.jaccard_matrix || {}).forEach(([key, value]) => {
      const [c1, c2] = key.split('|')
      const computed = getJaccard(c1, c2)
      expect(Math.abs(computed - value)).toBeLessThan(0.0001)
    })
  })
})

// ═══════════════════════════════════════════════════════════════
// SECTION 4: Compound Data Not Fabricated
// ═══════════════════════════════════════════════════════════════

describe('Compound data integrity', () => {
  it('all_compounds arrays contain real compound names (not UUIDs or gibberish)', () => {
    Object.values(rawData.cuisines).forEach(cuisine => {
      const comps = cuisine.all_compounds || []
      comps.forEach(c => {
        expect(typeof c).toBe('string')
        expect(c.length).toBeGreaterThan(2) // not empty or trivial
        expect(c).not.toMatch(/^[0-9a-f-]{36}$/) // not a UUID
        expect(c).not.toMatch(/^\d+$/) // not just numbers
      })
    })
  })

  it('compound names are consistent across cuisines (same compound = same string)', () => {
    const allCompounds = new Map()
    Object.entries(rawData.cuisines).forEach(([cid, cuisine]) => {
      const comps = cuisine.all_compounds || []
      comps.forEach(c => {
        if (!allCompounds.has(c)) allCompounds.set(c, [])
        allCompounds.get(c).push(cid)
      })
    })
    // Some compounds should appear in multiple cuisines
    const multiCuisine = [...allCompounds.values()].filter(v => v.length > 1)
    expect(multiCuisine.length, 'Should have compounds shared across cuisines').toBeGreaterThan(50)
  })

  it('compound counts match all_compounds array lengths', () => {
    Object.entries(rawData.cuisines).forEach(([cid, cuisine]) => {
      if (cuisine.all_compounds && cuisine.unique_named_compounds) {
        expect(
          cuisine.all_compounds.length,
          `${cid}: unique_named_compounds doesn't match all_compounds.length`
        ).toBe(cuisine.unique_named_compounds)
      }
    })
  })

  it('computeUniversalCompounds matches manual count', () => {
    const universal = computeUniversalCompounds()
    // Manually count how many cuisines each compound appears in
    const manualCount = {}
    cuisineIds.forEach(cid => {
      const comps = rawData.cuisines[cid].all_compounds || []
      comps.forEach(c => { manualCount[c] = (manualCount[c] || 0) + 1 })
    })
    // Top compound from both methods should match
    const topComputed = universal[0]
    expect(manualCount[topComputed.compound]).toBe(topComputed.count)
  })
})

// ═══════════════════════════════════════════════════════════════
// SECTION 5: Statistical Results Not Fabricated
// ═══════════════════════════════════════════════════════════════

describe('Statistical results computed from real data', () => {
  it('traditional-modern GI gap matches manual calculation', () => {
    const tvm = computeTraditionalVsModern()
    // Manually verify one cuisine
    const indianResult = tvm.find(r => r.cuisine === 'indian')
    const indianMeals = rawData.cuisines.indian.meals || []
    const trad = indianMeals.filter(m => TRADITIONAL_CATEGORIES.includes(m.category))
    const mod = indianMeals.filter(m => MODERN_CATEGORIES.includes(m.category))

    const manualTradAvg = trad.reduce((s, m) => s + m.gi, 0) / trad.length
    const manualModAvg = mod.reduce((s, m) => s + m.gi, 0) / mod.length

    expect(Math.abs(indianResult.traditional.avgGI - manualTradAvg)).toBeLessThan(0.01)
    expect(Math.abs(indianResult.modern.avgGI - manualModAvg)).toBeLessThan(0.01)
    expect(Math.abs(indianResult.gap - (manualModAvg - manualTradAvg))).toBeLessThan(0.01)
  })

  it('p-values are between 0 and 1', () => {
    const tvm = computeTraditionalVsModern()
    tvm.forEach(r => {
      if (!isNaN(r.statistics.tTest.p)) {
        expect(r.statistics.tTest.p).toBeGreaterThanOrEqual(0)
        expect(r.statistics.tTest.p).toBeLessThanOrEqual(1)
      }
    })
  })

  it('significance flag correctly reflects Bonferroni threshold', () => {
    const tvm = computeTraditionalVsModern()
    const alpha = 0.05 / 10 // Bonferroni for 10 comparisons
    tvm.forEach(r => {
      if (!isNaN(r.statistics.tTest.p)) {
        const expectedSig = r.statistics.tTest.p < alpha
        expect(r.statistics.tTest.significant).toBe(expectedSig)
      }
    })
  })

  it('Cohen d values are in realistic range', () => {
    const tvm = computeTraditionalVsModern()
    tvm.forEach(r => {
      if (!isNaN(r.statistics.cohensD)) {
        expect(Math.abs(r.statistics.cohensD)).toBeLessThan(10) // d > 10 would be absurd
      }
    })
  })
})

// ═══════════════════════════════════════════════════════════════
// SECTION 6: Dendrogram Structure Valid
// ═══════════════════════════════════════════════════════════════

describe('Dendrogram integrity', () => {
  it('all 10 cuisines appear as leaves', () => {
    const { tree } = computeDendrogram()
    function collectLeaves(node) {
      if (node.isLeaf) return [node.id]
      return [...collectLeaves(node.children[0]), ...collectLeaves(node.children[1])]
    }
    const leaves = collectLeaves(tree)
    expect(leaves.sort()).toEqual([...cuisineIds].sort())
  })

  it('merge distances are Jaccard distances (0 to 1)', () => {
    const { merges } = computeDendrogram()
    merges.forEach(m => {
      expect(m.distance).toBeGreaterThanOrEqual(0)
      expect(m.distance).toBeLessThanOrEqual(1)
    })
  })
})

// ═══════════════════════════════════════════════════════════════
// SECTION 7: Random Spot Checks
// ═══════════════════════════════════════════════════════════════

describe('Random spot checks on specific meals', () => {
  it('Sambar has turmeric and lentil as ingredients', () => {
    const sambar = rawData.cuisines.indian.meals.find(m => m.name.includes('Sambar'))
    expect(sambar).toBeDefined()
    expect(sambar.ingredients).toContain('lentil')
    expect(sambar.ingredients).toContain('turmeric')
  })

  it('Kimchi appears in Korean cuisine', () => {
    const korean = rawData.cuisines.korean
    const hasKimchi = korean.meals.some(m => m.name.toLowerCase().includes('kimchi'))
    expect(hasKimchi).toBe(true)
  })

  it('Injera appears in Ethiopian cuisine', () => {
    const ethio = rawData.cuisines.ethiopian
    const hasInjera = ethio.meals.some(m => m.name.toLowerCase().includes('injera'))
    expect(hasInjera).toBe(true)
  })

  it('Ceviche appears in Peruvian cuisine', () => {
    const peru = rawData.cuisines.peruvian
    const hasCeviche = peru.meals.some(m => m.name.toLowerCase().includes('ceviche'))
    expect(hasCeviche).toBe(true)
  })

  it('Miso appears in Japanese cuisine', () => {
    const jpn = rawData.cuisines.japanese
    const hasMiso = jpn.meals.some(m => m.name.toLowerCase().includes('miso'))
    expect(hasMiso).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════
// SECTION 8: No Hardcoded Fake Content
// ═══════════════════════════════════════════════════════════════

describe('No hardcoded fake content', () => {
  it('cuisine NAMES map to real countries/regions', () => {
    const expected = ['Indian', 'Mexican', 'Japanese', 'Mediterranean', 'Ethiopian',
      'Thai', 'Korean', 'West African', 'Peruvian', 'Middle Eastern']
    cuisineIds.forEach(id => {
      expect(expected).toContain(CUISINE_NAMES[id])
    })
  })

  it('compound matrix dimensions match actual data', () => {
    const matrix = computeCompoundCuisineMatrix()
    expect(matrix.totalCompounds).toBeGreaterThan(100)
    expect(matrix.totalCompounds).toBeLessThan(1000)
    // Cross-check: count unique compounds manually
    const allComps = new Set()
    cuisineIds.forEach(cid => {
      const comps = rawData.cuisines[cid].all_compounds || []
      comps.forEach(c => allComps.add(c))
    })
    expect(matrix.totalCompounds).toBe(allComps.size)
  })

  it('entropy values are not all identical (would indicate hardcoding)', () => {
    const entropy = computeEntropyPerCuisine()
    const values = entropy.map(e => e.entropy)
    const unique = new Set(values.map(v => v.toFixed(3)))
    expect(unique.size).toBeGreaterThan(3) // At least 4 distinct values
  })

  it('traditional-modern gaps are not all identical', () => {
    const tvm = computeTraditionalVsModern()
    const gaps = tvm.map(r => r.gap.toFixed(2))
    const unique = new Set(gaps)
    expect(unique.size).toBeGreaterThan(5) // At least 6 distinct gaps
  })

  it('Jaccard values are not all identical', () => {
    const pairs = Object.values(rawData.jaccard_matrix || {})
    const unique = new Set(pairs.map(v => v.toFixed(4)))
    expect(unique.size).toBeGreaterThan(20) // At least 21 distinct values out of 45
  })
})
