# Overhaul Plan: Cultural Cuisine Topology Map

**Goal:** Transform from a compelling prototype into a dual-track publication-ready project with (A) a public-facing interactive data essay and (B) a rigorous academic companion paper.

**Priority:** P0 = blocks publication, P1 = significantly strengthens, P2 = polish

---

## Phase 1: Fix Fatal Methodological Flaws (P0)

### 1.1 Replace Fabricated β₁ Persistence with Real TDA
**File:** `src/data/computed.js:96-99`
**Problem:** β₁ death times use `Math.random()` — not computed from the simplicial complex.
**Fix:**
- Option A: Pre-compute persistence diagrams using Python `ripser` or `gudhi`, export as JSON
- Option B: Port a minimal Vietoris-Rips persistent homology computation to JS (heavy)
- Option C (recommended): Use a build-time Python script that runs `ripser` on the Jaccard distance matrix and outputs `persistence.json`, consumed by the frontend
- **Deliverable:** `scripts/compute_persistence.py` → `public/data/persistence.json`

### 1.2 Separate Measured vs. Estimated GI Values
**File:** `src/data/cuisines.json` (all 1,932 meals)
**Problem:** Many GI values are estimated from category heuristics (e.g., "est. legume range 22-38") but treated identically to measured values.
**Fix:**
- Add `gi_measured: true|false` flag to every meal object
- Add `gi_confidence: "measured"|"category_estimate"|"interpolated"` field
- Update all visualizations to distinguish measured vs. estimated (e.g., filled vs. hollow dots in beeswarm)
- Report % measured vs. estimated in methodology section
- Run sensitivity analysis: do conclusions hold when restricted to measured-only?

### 1.3 Add Statistical Inference to Traditional vs. Modern Comparison
**File:** `src/data/computed.js` (computeTraditionalVsModern)
**Problem:** No hypothesis tests, confidence intervals, or effect sizes.
**Fix:**
- Compute Welch's t-test (or Mann-Whitney U) for each cuisine's traditional vs. modern GI gap
- Report p-values with Bonferroni correction (10 comparisons → α = 0.005)
- Compute Cohen's d effect size per cuisine
- Add 95% bootstrap confidence intervals for mean GI differences
- Display significance indicators in the DumbbellChart (*, **, ***)
- **Deliverable:** New `computeStatisticalTests()` function in computed.js

---

## Phase 2: Reframe or Deepen the Topology (P0)

### 2.1 Honest Reframing of TDA at n=10
**Problem:** TDA on 10 points is too small for meaningful topological features.
**Two options (pick one):**

**Option A — Reframe as Network Analysis (easier, more honest):**
- Rename section from "Topology Explorer" to "Cuisine Similarity Network"
- Replace "TDA" language with "network clustering" and "hierarchical structure"
- Keep the persistence diagram as a pedagogical tool ("here's what TDA looks like on this data") but don't claim it reveals hidden structure
- Add a proper dendrogram (hierarchical clustering) as the primary analytical viz

**Option B — Apply TDA at Compound Level (harder, more novel):**
- Treat each compound as a point in cuisine-space (binary vector: present/absent in each cuisine)
- Apply TDA to the compound point cloud (333 points in 10-dimensional binary space)
- This produces genuinely meaningful persistence diagrams with real topological features
- Would require pre-computation (Python script) but dramatically strengthens the novelty claim
- **Recommended for academic track**

### 2.2 Add Hierarchical Clustering Dendrogram
**New file:** `src/viz/DendrogramChart.jsx`
- UPGMA or Ward's method on Jaccard distance matrix
- Shows how cuisines cluster at different similarity thresholds
- More interpretable than persistence diagram for n=10
- Complements the force network view

---

## Phase 3: Strengthen Data Pipeline (P1)

### 3.1 Create Reproducibility Package
**New directory:** `scripts/`
- `scripts/build_dataset.py` — Reconstruct cuisines.json from raw ingredient lists + compound databases
- `scripts/compute_persistence.py` — Run ripser on Jaccard matrix
- `scripts/compute_statistics.py` — Statistical tests, CIs, effect sizes
- `scripts/validate_gi.py` — Cross-reference GI values against cited PMC sources
- `requirements.txt` for Python dependencies
- Document the full pipeline in `METHODOLOGY.md`

### 3.2 Validate Compound Mappings
- Add cooking-method modifiers (raw vs. cooked compound profiles differ significantly)
- Cross-reference at least a sample of dishes against GC-MS literature
- Add confidence scores to compound assignments
- Document known gaps and limitations explicitly

### 3.3 Bootstrap Stability Analysis
- Sample ingredients with replacement (1000 iterations)
- Recompute Jaccard matrix each time
- Report stability of cuisine similarities (mean ± SD for each pair)
- Visualize as error bars on the heatmap

---

## Phase 4: Academic Paper Structure (P1)

### 4.1 Write Companion Paper
Target: ~6,000 words + figures for Food Research International or IEEE VIS

**Structure:**
1. **Introduction** — Mediterranean bias in dietary guidance, the cultural adherence problem
2. **Related Work** — Ahn et al. 2011, Jain et al. 2015, Caprioli et al. 2025, flavor network literature, TDA in food science
3. **Data & Methods**
   - Data sources and curation pipeline
   - Jaccard similarity and compound mapping methodology
   - Topological data analysis (if Option B chosen) or network analysis
   - GI comparison framework with statistical tests
4. **Results**
   - Cuisine similarity structure (clustering, key bridges)
   - Compound family profiles (terpene-dominant vs. sulfide-dominant cuisines)
   - Traditional vs. modern GI gaps with significance testing
   - Universal vs. unique compound analysis
5. **Interactive System** — Design rationale, scrollytelling architecture, user study results
6. **Discussion** — Implications for culturally-specific dietary guidance
7. **Limitations** — Expanded from current; compound mapping caveats, GI estimation, cultural categorization

### 4.2 Justify Traditional vs. Modern Categorization
- Current split (legumes/veg/fermented = traditional, fried/dessert/refined = modern) needs ethnographic grounding
- Add citations from food anthropology literature
- Consider a more nuanced categorization (pre-colonial, colonial-era, post-industrial)
- Or let the data speak: cluster meals by compound profile and see if traditional/modern separation emerges naturally

---

## Phase 5: Public-Facing Polish (P2)

### 5.1 Accessibility & Performance
- Add ARIA labels to all interactive visualizations
- Add alt-text descriptions for screen readers
- Lazy-load heavy visualizations (Three.js globe, force network)
- Add `loading="lazy"` for below-fold sections
- Test on mobile (Three.js globe may need a 2D fallback)

### 5.2 Narrative Strengthening
- Add a "How to Read This" onboarding overlay for each visualization
- Add personal stories / cultural context quotes for each cuisine
- Add a "Find Your Cuisine" entry point for non-academic visitors
- Consider adding a "Build Your Plate" interactive tool

### 5.3 SEO & Shareability
- Add Open Graph meta tags
- Add Twitter Card meta tags
- Generate a static preview image for social sharing
- Add structured data (JSON-LD) for Google Scholar discovery

---

## Phase 6: Infrastructure (P2)

### 6.1 Vercel Deployment (DONE — see vercel.json)
- SPA routing with rewrites
- Cache headers for static assets
- Source maps in production for debugging

### 6.2 Testing
- Add Vitest for unit tests on computed.js functions
- Add Playwright for E2E smoke tests (each section renders, no console errors)
- Add visual regression tests for key visualizations

### 6.3 CI/CD
- GitHub Actions workflow: lint → test → build → deploy preview
- Branch previews for PR review

---

## Implementation Priority Order

| Order | Task | Effort | Impact |
|-------|------|--------|--------|
| 1 | Fix β₁ persistence (1.1) | Medium | Critical — removes fabricated data |
| 2 | Add GI measured/estimated flags (1.2) | Medium | Critical — data integrity |
| 3 | Add statistical tests (1.3) | Low | Critical — scientific rigor |
| 4 | Reframe TDA or apply at compound level (2.1) | High | Critical — intellectual honesty |
| 5 | Vercel deployment (6.1) | Low | Immediate visibility |
| 6 | Reproducibility scripts (3.1) | Medium | Required for publication |
| 7 | Dendrogram visualization (2.2) | Low | Strengthens analysis |
| 8 | Companion paper draft (4.1) | High | Publication target |
| 9 | Accessibility & performance (5.1) | Medium | Public audience |
| 10 | Testing & CI/CD (6.2, 6.3) | Medium | Long-term quality |

---

## Timeline Estimate

- **Phase 1 (Fatal fixes):** First priority
- **Phase 2 (TDA reframe):** Second priority
- **Phase 3 (Reproducibility):** Third priority
- **Phase 4 (Paper):** Parallel with Phases 2-3
- **Phase 5-6 (Polish):** After core science is solid
