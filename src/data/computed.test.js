import { describe, it, expect } from 'vitest'
import {
  getJaccard,
  getOverlap,
  sortedPairs,
  cuisineIds,
  totalMeals,
  computePersistenceDiagram,
  computeBettiNumbers,
  computeEntropyPerCuisine,
  computeFlavorFingerprints,
  computeTraditionalVsModern,
  computeUniversalCompounds,
  computeDendrogram,
  computeCompoundCuisineMatrix,
  computeGISensitivity,
  cuisineSummaries,
} from './computed'

describe('Core data integrity', () => {
  it('has 10 cuisines', () => {
    expect(cuisineIds).toHaveLength(10)
  })

  it('has the expected cuisine IDs', () => {
    const expected = ['indian', 'mexican', 'japanese', 'mediterranean', 'ethiopian', 'thai', 'korean', 'west_african', 'peruvian', 'middle_eastern']
    expected.forEach(id => {
      expect(cuisineIds).toContain(id)
    })
  })

  it('has >1900 total meals', () => {
    expect(totalMeals).toBeGreaterThan(1900)
  })

  it('cuisineSummaries has 10 entries', () => {
    expect(cuisineSummaries).toHaveLength(10)
  })
})

describe('Jaccard similarity', () => {
  it('returns 1 for same cuisine', () => {
    expect(getJaccard('indian', 'indian')).toBe(1.0)
  })

  it('returns value between 0 and 1 for different cuisines', () => {
    const j = getJaccard('indian', 'thai')
    expect(j).toBeGreaterThan(0)
    expect(j).toBeLessThanOrEqual(1)
  })

  it('is symmetric', () => {
    expect(getJaccard('indian', 'japanese')).toBe(getJaccard('japanese', 'indian'))
  })

  it('sortedPairs has 45 entries (10 choose 2)', () => {
    expect(sortedPairs).toHaveLength(45)
  })

  it('sortedPairs is sorted descending by Jaccard', () => {
    for (let i = 1; i < sortedPairs.length; i++) {
      expect(sortedPairs[i - 1].jaccard).toBeGreaterThanOrEqual(sortedPairs[i].jaccard)
    }
  })
})

describe('Persistence diagram (exact computation)', () => {
  it('returns valid beta0 and beta1 features', () => {
    const { beta0Features, beta1Features, metadata } = computePersistenceDiagram()

    expect(beta0Features.length).toBeGreaterThan(0)
    expect(metadata.n_points).toBe(10)
    expect(metadata.n_edges).toBe(45)
    expect(metadata.beta1_method).toBe('Boundary matrix column reduction (exact)')
  })

  it('has exactly one infinite beta0 feature', () => {
    const { beta0Features } = computePersistenceDiagram()
    const infinite = beta0Features.filter(f => f.death === Infinity)
    expect(infinite).toHaveLength(1)
  })

  it('has n-1 finite beta0 features (9 merges for 10 points)', () => {
    const { beta0Features } = computePersistenceDiagram()
    const finite = beta0Features.filter(f => f.death !== Infinity)
    expect(finite).toHaveLength(9)
  })

  it('all beta0 features born at 0', () => {
    const { beta0Features } = computePersistenceDiagram()
    beta0Features.forEach(f => {
      expect(f.birth).toBe(0)
    })
  })

  it('beta0 death times are valid Jaccard distances (0 to 1)', () => {
    const { beta0Features } = computePersistenceDiagram()
    beta0Features.filter(f => f.death !== Infinity).forEach(f => {
      expect(f.death).toBeGreaterThan(0)
      expect(f.death).toBeLessThanOrEqual(1)
    })
  })

  it('beta1 features have birth <= death (no negative persistence)', () => {
    const { beta1Features } = computePersistenceDiagram()
    beta1Features.forEach(f => {
      if (f.death !== Infinity) {
        expect(f.death).toBeGreaterThanOrEqual(f.birth)
      }
    })
  })

  it('beta1 death times are NOT random (deterministic)', () => {
    const run1 = computePersistenceDiagram()
    const run2 = computePersistenceDiagram()
    expect(run1.beta1Features).toEqual(run2.beta1Features)
  })
})

describe('Betti numbers', () => {
  it('returns entries for all thresholds', () => {
    const betti = computeBettiNumbers()
    expect(betti.length).toBe(15)
  })

  it('beta0 is always between 1 and 10', () => {
    const betti = computeBettiNumbers()
    betti.forEach(b => {
      expect(b.beta0).toBeGreaterThanOrEqual(1)
      expect(b.beta0).toBeLessThanOrEqual(10)
    })
  })

  it('beta1 is non-negative', () => {
    const betti = computeBettiNumbers()
    betti.forEach(b => {
      expect(b.beta1).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('Shannon entropy', () => {
  it('returns entropy for all 10 cuisines', () => {
    const entropy = computeEntropyPerCuisine()
    expect(entropy).toHaveLength(10)
  })

  it('entropy is non-negative', () => {
    const entropy = computeEntropyPerCuisine()
    entropy.forEach(e => {
      expect(e.entropy).toBeGreaterThanOrEqual(0)
    })
  })

  it('includes uniqueCount and universalCount', () => {
    const entropy = computeEntropyPerCuisine()
    entropy.forEach(e => {
      expect(e).toHaveProperty('uniqueCount')
      expect(e).toHaveProperty('universalCount')
    })
  })
})

describe('Traditional vs Modern GI (with statistics)', () => {
  it('returns data for all 10 cuisines', () => {
    const tvm = computeTraditionalVsModern()
    expect(tvm).toHaveLength(10)
  })

  it('includes statistical tests', () => {
    const tvm = computeTraditionalVsModern()
    tvm.forEach(row => {
      expect(row).toHaveProperty('statistics')
      expect(row.statistics).toHaveProperty('tTest')
      expect(row.statistics).toHaveProperty('cohensD')
      expect(row.statistics).toHaveProperty('bootstrapCI')
      expect(row.statistics).toHaveProperty('stars')
      expect(row.statistics).toHaveProperty('bonferroniAlpha')
    })
  })

  it('Bonferroni alpha is 0.005 for 10 cuisines', () => {
    const tvm = computeTraditionalVsModern()
    expect(tvm[0].statistics.bonferroniAlpha).toBeCloseTo(0.005)
  })

  it('significance stars match p-value thresholds', () => {
    const tvm = computeTraditionalVsModern()
    tvm.forEach(row => {
      const p = row.statistics.tTest.p
      const stars = row.statistics.stars
      if (!isNaN(p)) {
        if (p < 0.001) expect(stars).toBe('***')
        else if (p < 0.01) expect(stars).toBe('**')
        else if (p < 0.05) expect(stars).toBe('*')
        else expect(stars).toBe('')
      }
    })
  })

  it('bootstrap CI is deterministic (seeded PRNG)', () => {
    const run1 = computeTraditionalVsModern()
    const run2 = computeTraditionalVsModern()
    run1.forEach((row, i) => {
      expect(row.statistics.bootstrapCI.lower).toBe(run2[i].statistics.bootstrapCI.lower)
      expect(row.statistics.bootstrapCI.upper).toBe(run2[i].statistics.bootstrapCI.upper)
    })
  })

  it('includes standard deviations', () => {
    const tvm = computeTraditionalVsModern()
    tvm.forEach(row => {
      expect(row.traditional).toHaveProperty('sdGI')
      expect(row.modern).toHaveProperty('sdGI')
    })
  })
})

describe('Hierarchical clustering (UPGMA dendrogram)', () => {
  it('returns a tree and merges', () => {
    const { tree, merges, method } = computeDendrogram()
    expect(tree).toBeDefined()
    expect(merges).toHaveLength(9) // n-1 merges for 10 points
    expect(method).toContain('UPGMA')
  })

  it('merge distances are monotonically non-decreasing', () => {
    const { merges } = computeDendrogram()
    for (let i = 1; i < merges.length; i++) {
      expect(merges[i].distance).toBeGreaterThanOrEqual(merges[i - 1].distance)
    }
  })

  it('tree root is not a leaf', () => {
    const { tree } = computeDendrogram()
    expect(tree.isLeaf).toBe(false)
    expect(tree.children).toHaveLength(2)
  })

  it('tree has exactly 10 leaves', () => {
    const { tree } = computeDendrogram()
    function countLeaves(node) {
      if (node.isLeaf) return 1
      return node.children.reduce((s, c) => s + countLeaves(c), 0)
    }
    expect(countLeaves(tree)).toBe(10)
  })
})

describe('Compound-level analysis', () => {
  it('returns compound matrix with metadata', () => {
    const result = computeCompoundCuisineMatrix()
    expect(result.totalCompounds).toBeGreaterThan(100)
    expect(result.metadata.suitableForTDA).toBe(true)
  })

  it('has valid distribution counts', () => {
    const result = computeCompoundCuisineMatrix()
    const dist = result.cuisineCountDistribution
    expect(dist.unique).toBeGreaterThanOrEqual(0)
    expect(dist.rare).toBeGreaterThanOrEqual(dist.unique)
    expect(dist.universal).toBeGreaterThanOrEqual(0)
  })
})

describe('GI sensitivity analysis', () => {
  it('returns data for all 10 cuisines', () => {
    const result = computeGISensitivity()
    expect(result).toHaveLength(10)
  })

  it('measured + estimated = total for each cuisine', () => {
    const result = computeGISensitivity()
    result.forEach(row => {
      expect(row.measuredCount + row.estimatedCount).toBe(row.totalMeals)
    })
  })

  it('measuredPct is between 0 and 100', () => {
    const result = computeGISensitivity()
    result.forEach(row => {
      expect(row.measuredPct).toBeGreaterThanOrEqual(0)
      expect(row.measuredPct).toBeLessThanOrEqual(100)
    })
  })
})

describe('Flavor fingerprints', () => {
  it('returns profiles for all 10 cuisines', () => {
    const fps = computeFlavorFingerprints()
    expect(fps).toHaveLength(10)
  })

  it('normalized values sum to approximately 1', () => {
    const fps = computeFlavorFingerprints()
    fps.forEach(fp => {
      const sum = Object.values(fp.normalized).reduce((s, v) => s + v, 0)
      expect(sum).toBeCloseTo(1, 1)
    })
  })
})

describe('Universal compounds', () => {
  it('returns sorted by count descending', () => {
    const result = computeUniversalCompounds()
    expect(result.length).toBeGreaterThan(0)
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].count).toBeGreaterThanOrEqual(result[i].count)
    }
  })
})
