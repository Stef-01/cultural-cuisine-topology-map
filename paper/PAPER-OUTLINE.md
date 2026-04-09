# Paper Outline: Topological Analysis of Cuisine Flavor Compound Networks and Glycemic Impact

**Target:** Food Research International / IEEE VIS (Short Paper)
**Length:** ~6,000 words + figures
**Status:** OUTLINE — requires domain expert co-author for submission

---

## Abstract (~200 words)

We present an interactive data visualization and computational analysis that maps flavor molecule chemistry and glycemic impact across 10 world cuisines. Using compound presence/absence data from FlavorDB2 and FooDB (333 named compounds across 73 ingredients), we compute pairwise Jaccard and cosine similarities, perform hierarchical clustering (UPGMA), and apply persistent homology (Vietoris-Rips) to the compound-level point cloud (n=333 in 10-dimensional binary space). We complement molecular similarity analysis with a comparison of glycemic indices between traditional and modern food preparations, using Welch's t-test with Bonferroni correction. Our analysis reveals [findings from measured data only]. We contribute: (1) a reproducible computational pipeline for cross-cultural cuisine comparison, (2) an interactive visualization system with dual public/researcher views, and (3) compound-level topological features that reveal genuine clustering structure in flavor chemistry. We acknowledge significant data limitations: only 2.8% of GI values are laboratory-measured, and our results should be treated as hypothesis-generating for future clinical validation.

---

## 1. Introduction (~800 words)

### 1.1 The Cultural Adherence Problem
- Global dietary guidance dominated by Mediterranean diet paradigm
- 85% of world population does not eat Mediterranean food
- Cultural disconnect → poor adherence to dietary recommendations
- The need for culturally-specific, evidence-based nutrition guidance

### 1.2 Flavor Chemistry as a Bridge
- Flavor compounds as a universal molecular language across cuisines
- Compound similarity networks reveal hidden connections between culinary traditions
- Potential to identify culturally-authentic low-GI alternatives within any cuisine

### 1.3 Contributions
1. **Computational pipeline:** Reproducible compound mapping → similarity → TDA pipeline
2. **Interactive system:** Dual-view (public/researcher) web application with 12+ visualizations
3. **Topological analysis:** First application of persistent homology to compound-level cuisine networks (n=333)
4. **Honest methodology:** Transparent handling of data limitations (83% estimated GI, n=10 cuisine selection)

---

## 2. Related Work (~800 words)

### 2.1 Flavor Network Analysis
- Ahn et al. (2011) — Flavor network, food pairing hypothesis, 381 ingredients
- Jain et al. (2015) — Indian cuisine, negative food pairing
- Caprioli et al. (2025) — Culinary fingerprints via ingredient-type networks, SVM 95%

### 2.2 Glycemic Index and Cultural Nutrition
- Jenkins et al. (1981) — Original GI definition
- PMC7791047 — Non-Western food GI compendium (1,100+ values)
- Popkin (2006) — Nutrition transition framework
- Monteiro et al. (2019) — NOVA ultra-processed food classification

### 2.3 Topological Data Analysis in Food Science
- [Limited prior work — this is where our novelty lies]
- TDA applications in biology, genomics, materials science
- Gap: no prior application of persistent homology to cuisine compound networks

### 2.4 Interactive Visualization for Nutrition
- The Pudding, Flowing Data — data essay format
- Existing nutrition tools (MyFitnessPal, Cronometer) — individual-focused, not cultural
- Gap: no interactive tool for cross-cultural cuisine comparison at the molecular level

---

## 3. Data & Methods (~1,500 words)

### 3.1 Data Sources and Curation
- FlavorDB2: 25,595 molecules, 936 ingredients (Goel et al. 2024)
- FooDB: 70,926 compounds, ~28,000 with experimental evidence
- GI values: PMC7791047, PMC9304465, PMC9552392
- **Honest disclosure:** 73 ingredients, 333 named compounds, 1,932 meals
- **GI confidence tiers:** measured (n=55, 2.8%), estimated (n=1607, 83.2%), protein-zero (n=270, 14.0%)

### 3.2 Compound Similarity Metrics
- Jaccard similarity: J(A,B) = |A ∩ B| / |A ∪ B|
- Cosine similarity on binary compound vectors
- **Limitation:** Binary presence/absence, no abundance data
- Bootstrap stability analysis (500 iterations, seeded PRNG)

### 3.3 Hierarchical Clustering
- UPGMA on Jaccard distance matrix
- Dendrogram as primary analytical visualization for n=10

### 3.4 Persistent Homology
- **Cuisine-level (n=10):** Pedagogical illustration only. Too small for meaningful topology.
- **Compound-level (n=333):** Vietoris-Rips filtration on Hamming distance in 10-dimensional binary space.
  - β₀: Union-Find (exact)
  - β₁: [Requires Ripser — not computed in JS version]
  - Cluster count analysis at 8 distance thresholds

### 3.5 Glycemic Index Analysis
- Traditional vs. modern categorization (NOVA-aligned, ethnographically justified)
- Welch's t-test, Bonferroni correction (α = 0.005)
- Cohen's d effect sizes
- Bootstrap 95% CIs (2,000 iterations, seed=42)
- **All results reported for: full dataset AND measured-only subset**

### 3.6 Shannon Entropy
- Per-cuisine compound-sharing diversity measure
- Interpretation: higher H = more compounds shared broadly, lower H = more unique compounds

---

## 4. Results (~1,000 words)

### 4.1 Cuisine Similarity Structure
- Hierarchical clustering reveals [X] major cuisine groups
- Top Jaccard pairs: [from data]
- Bootstrap stability: [from data]
- Cosine similarity corroborates Jaccard ranking

### 4.2 Compound-Level Topological Features
- Persistence diagram (n=333) shows [X] long-lived β₀ features
- Cluster structure at key thresholds: [from data]
- Comparison with random baseline (permutation test)

### 4.3 Traditional vs. Modern GI Gap
- **Full dataset:** [gaps, p-values, effect sizes]
- **Measured-only subset (n=55):** [honest comparison — likely underpowered]
- **Key caveat:** Full-dataset results are hypothesis-generating only

### 4.4 Flavor Fingerprints and Entropy
- Cuisine entropy spectrum: [most unique] to [most shared]
- Compound family profiles (terpene-dominant vs. sulfide-dominant cuisines)

---

## 5. Interactive System (~500 words)

### 5.1 Design Rationale
- Scrollytelling narrative for public engagement
- Dual-view toggle (public/researcher)
- React 18 + Three.js + D3.js + Vite 5

### 5.2 Visualization Components (12+)
- Force network, dendrogram, persistence diagrams (n=10 + n=333)
- Heatmap, beeswarm, dumbbell chart with error bars
- Flow diagram (co-occurrence), radar chart, treemap
- 3D globe (WebGL) with mobile 2D SVG fallback
- Build Your Plate interactive meal planner

### 5.3 Accessibility
- ARIA tabs, SVG titles, keyboard navigation, print styles
- Error boundaries, lazy loading, code splitting

---

## 6. Discussion (~800 words)

### 6.1 What the Data Shows
- Cross-cultural compound similarity is real and quantifiable
- Traditional preparations cluster with low-GI foods (expected from food science)
- Compound-level TDA reveals genuine topological structure

### 6.2 What the Data Does NOT Show
- No causal mechanism for "traditional = healthy"
- GI estimates cannot replace laboratory measurement
- Ingredient-compound mappings are literature-derived, not experimentally validated
- Selection bias: 10 hand-picked cuisines

### 6.3 Implications for Practice
- Culturally-specific dietary guidance as an alternative to one-size-fits-all
- This tool is exploratory, not prescriptive

### 6.4 Future Work
- Laboratory GI measurement for estimated meals
- Per-ingredient compound mapping from FlavorDB2
- Cooking-method compound profile adjustments
- Addition of 5+ cuisines (Chinese, Indonesian, Brazilian, Turkish, Nigerian)
- β₁ persistent homology via Ripser

---

## 7. Conclusion (~200 words)

We present an interactive data visualization that makes cross-cultural cuisine chemistry accessible to both researchers and the general public. Our analysis reveals genuine compound similarity structure across 10 world cuisines, provides compound-level topological features via persistent homology, and offers culturally-specific dietary guidance. We are transparent about significant limitations in the GI data (83% estimated) and frame our results as hypothesis-generating for future clinical validation. The visualization system, dataset, and computational pipeline are openly available.

---

## References (~40 citations)

[To be populated from existing DATA_SOURCES + additional references]

---

## Supplementary Materials

- S1: Full dataset (cuisines.json, 748KB)
- S2: Computed statistics (all t-tests, CIs, bootstrap results)
- S3: Python reproducibility scripts
- S4: Data integrity test suite (99 tests)
- S5: GI validation report (validate_gi.py output)
