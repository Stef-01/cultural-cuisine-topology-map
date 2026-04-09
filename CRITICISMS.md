# Critical Appraisal: What's Wrong with This Project

**Reviewer perspective:** Senior Stanford Professor, Computational Biology / Food Informatics
**Date:** April 2026
**Verdict:** Publish as a data visualization essay, not as science. Significant methodological issues must be addressed before any journal submission claims empirical rigor.

---

## Fatal Flaws

### 1. 83% of GI Values Are Fabricated Estimates

The single most damaging issue. Of 1,932 meals in the dataset:

- **325 meals (16.8%)** have GI values from published measurements
- **1,607 meals (83.2%)** have GI values estimated from category heuristics ("est. legume range 22-38", "est. soup/broth", etc.)
- **270 meals (14.0%)** are pure protein dishes assigned GI=0

**Why this is fatal:**
- The entire traditional-vs-modern comparison rests on comparing measured GI values (mostly protein=0) against estimated GI values (mostly vegetables/grains=25-50). This is comparing apples to oranges.
- Per-cuisine "measured" averages are wildly different from "all" averages:
  - Mexican: measured avg = 0.8, all avg = 32.2 (delta = 31.4)
  - Mediterranean: measured avg = 0.0, all avg = 32.4 (delta = 32.4)
  - Peruvian: measured avg = 8.2, all avg = 42.1 (delta = 33.9)
- The "statistical significance" of traditional-modern GI gaps is meaningless when 83% of the dependent variable is estimated from the independent variable (category → GI).

**What a reviewer would say:** "You're testing whether food categories predict glycemic index, but you've already assigned GI values based on food category. This is circular reasoning."

**Checklist to fix:**
- [ ] Add `gi_measured: true|false` flag to every meal in cuisines.json
- [ ] Re-run ALL analyses restricted to measured-only subset
- [ ] If measured-only subset is too small (it will be), acknowledge this as a fundamental limitation
- [ ] Remove all claims of "statistical significance" until measured-only analysis validates them
- [ ] Show measured vs. estimated results side-by-side in every visualization

---

### 2. TDA on n=10 Is Cargo-Cult Science

Applying Topological Data Analysis to 10 data points is like using a particle accelerator to weigh a bag of flour. The math is correct. The application is absurd.

**Why this is problematic:**
- With n=10 points, the Vietoris-Rips complex has at most 45 edges, 120 triangles, and 210 tetrahedra
- β₀ persistence (connected components merging) is just hierarchical clustering in disguise
- β₁ features (loops) in a 10-point complex are noise — there's no way to distinguish topological signal from random structure at this scale
- The persistence diagram looks exactly like what you'd get from 10 random points

**What a TDA expert would say:** "This is a pedagogical illustration, not an analysis. Calling it 'Topology Explorer' implies it reveals hidden structure. It doesn't. A dendrogram conveys the same information more honestly."

**The project's own OVERHAUL-PLAN.md acknowledges this** (line 43-60) but the UI still prominently features "Persistence Diagram" and "Betti Numbers" as if they're meaningful findings.

**Checklist to fix:**
- [ ] Rename "Topology Explorer" to "Cuisine Similarity Explorer" or "Network Analysis"
- [ ] Move persistence diagram and Betti chart to a "Pedagogical TDA" sub-tab clearly labeled as illustrative
- [ ] Make the dendrogram the PRIMARY analytical visualization (it already exists but is secondary)
- [ ] If pursuing compound-level TDA (n=333), do it properly in Python with Ripser and import results — don't pretend 10-point TDA is meaningful
- [ ] Or: Reframe the TDA section explicitly as "What does applied topology look like on small data?" — educational, not analytical

---

### 3. Ingredient → Compound Flow Diagram Shows Correlation, Not Causation

The FlowChart visualization (`src/viz/FlowChart.jsx`) links ingredients to compounds based on co-occurrence within cuisines. This is scientifically invalid.

**The problem:**
- `computeIngredientFlow()` in computed.js maps ingredients to ALL compounds in their cuisine, not to the specific compounds each ingredient produces
- Example: garlic and turmeric both appear in Indian cuisine. The flow diagram implies garlic contributes to curcumin (a turmeric compound). It does not.
- Every ingredient in a cuisine is linked to every compound in that cuisine — this is a dense bipartite graph, not a meaningful flow

**What a chemist would say:** "This diagram is nonsensical. Limonene comes from citrus peel, not from garlic. You can't infer ingredient-compound relationships from cuisine-level co-occurrence."

**Checklist to fix:**
- [ ] Replace cuisine-level co-occurrence with ingredient-level compound mapping from FlavorDB2/FooDB
- [ ] Or: Remove the flow diagram entirely and replace with a per-ingredient compound lookup
- [ ] Or: Relabel as "Cuisine Ingredient-Compound Co-occurrence" (not "flow") with explicit caveat that links show co-occurrence, not contribution
- [ ] Add per-ingredient compound lists from FlavorDB2 to the dataset

---

### 4. The "Your Grandmother Was Right" Thesis Is Romantic A Posteriori Storytelling

The project's central narrative — that traditional cuisines were "optimized" for low glycemic impact — is not supported by the evidence presented.

**Problems:**
1. **No causal mechanism.** Traditional foods happen to be lower-GI because they use whole ingredients. This is a trivial observation, not a discovery. Grandmothers weren't optimizing for GI (a concept that didn't exist until 1981).
2. **Survivorship bias.** We only see cuisines that survived. Many traditional food systems produced terrible health outcomes (pellagra from corn-based diets, scurvy from preserved-food diets, beriberi from polished rice).
3. **The traditional/modern binary is a false dichotomy.** It conflates "whole ingredient" with "traditional" and "processed" with "modern." Many traditional preparations are heavily processed (fermented, smoked, dried, salted).
4. **The 83% estimated GI problem** (Flaw 1) means the gap between traditional and modern GI is largely an artifact of how categories were assigned GI values.

**What a food historian would say:** "The 'grandmother' trope romanticizes pre-industrial food systems that also produced widespread malnutrition, seasonal famine, and food-borne illness. Traditional ≠ healthy. Modern ≠ unhealthy. Reality is more complex."

**Checklist to fix:**
- [ ] Reframe from "your grandmother was right" to "traditional preparations tend to use lower-GI ingredients"
- [ ] Add caveats about survivorship bias and the nutrition transition
- [ ] Cite actual food anthropology (Mintz "Sweetness and Power", Pollan "In Defense of Food", Popkin "nutrition transition" literature)
- [ ] Acknowledge that the low-GI observation is trivially expected when comparing whole foods to refined foods
- [ ] Remove implication of intentional optimization — replace with "coincidental alignment with modern metabolic health goals"

---

### 5. Build Your Plate Makes Medical Claims Without Disclaimers

`PlatePlanner.jsx` tells users their plate is "great for steady energy and blood sugar management." This is a medical claim.

**Problems:**
- GI is a deeply flawed single-food metric that doesn't account for:
  - Glycemic load (portion size)
  - Food combining effects (fat + protein slow glucose absorption)
  - Cooking method (boiled vs. fried can shift GI by 20+ points)
  - Individual insulin sensitivity (varies 2-3x between people)
  - Gut microbiome composition
- A diabetic patient relying on this tool instead of consulting a dietitian could come to harm
- No disclaimer about the 83% estimated GI values

**What a physician would say:** "This tool could be dangerous. GI alone does not predict postprandial glucose response. If someone with Type 2 diabetes uses this to plan meals, they could experience hypoglycemic or hyperglycemic episodes."

**Checklist to fix:**
- [ ] Add prominent medical disclaimer: "This is an educational tool, not medical advice. Consult a registered dietitian or endocrinologist for personalized nutrition guidance."
- [ ] Remove the phrase "blood sugar management"
- [ ] Add note that GI values are population averages and individual responses vary significantly
- [ ] Flag that 83% of GI values are estimates, not measurements
- [ ] Consider adding Glycemic Load (GI × portion size) instead of raw GI

---

## Serious But Non-Fatal Flaws

### 6. Compound Mapping Is Coarse and Unvalidated

The 73 ingredients → 333 compounds mapping is literature-derived but never validated:
- No accounting for cooking method (Maillard reaction produces hundreds of new compounds)
- No concentration data (a compound "present" at 0.001ppm is different from 100ppm)
- No distinction between volatile (aroma) and non-volatile (taste) compounds
- The same compound list is used for raw and cooked preparations

### 7. Shannon Entropy Interpretation Is Misleading

The entropy calculation measures compound-sharing distribution, not "uniqueness" per se. A cuisine with all compounds shared equally across 5 cuisines and all compounds shared equally across 1 cuisine would have different entropies, but neither is "more unique." The interpretation in the UI conflates entropy with uniqueness.

### 8. The Jaccard Similarity Doesn't Account for Compound Abundance

Jaccard treats every compound as binary (present/absent). A cuisine where curcumin is the dominant flavor compound and one where it's a trace component get the same similarity score. This is a known limitation of Jaccard but is never acknowledged in the UI.

### 9. Missing Cuisines Introduce Selection Bias

10 cuisines were hand-picked. Missing: Chinese (1.4B people), Indonesian, Nigerian (distinct from "West African"), Brazilian, Turkish, French (distinct from "Mediterranean"). The selection biases toward cuisines with existing English-language GI literature.

### 10. No Error Propagation

Estimated GI values should carry uncertainty ranges. A meal estimated as "legume range 22-38" should be modeled as a distribution, not a point estimate. All downstream statistics (means, t-tests, CIs) should propagate this uncertainty. They don't.

---

## What This Project Actually Is (And Should Claim to Be)

**What it claims:** A rigorous multi-dimensional analysis of cuisine flavor chemistry and glycemic impact, using topological data analysis to reveal hidden molecular geography.

**What it actually is:** A beautifully crafted interactive data visualization that illustrates interesting patterns in cuisine similarity, with exploratory (not confirmatory) analysis of glycemic indices. The visualization design is genuinely excellent. The science needs significant hardening.

**Recommended honest framing:**
> "An interactive data essay exploring flavor molecule similarity and glycemic patterns across 10 world cuisines. Compound similarities are computed from published databases; GI values are a mix of published measurements and category-based estimates. This is an educational exploration, not a clinical tool."

---

## Revised Impact Score (Post-Critique)

| Dimension | Original Score | Revised Score | Notes |
|---|---|---|---|
| Novelty | 6/10 | 5/10 | Compound similarity is well-studied; TDA on n=10 adds nothing |
| Scientific Impact | 5/10 | 3/10 | Claims not supported; 83% estimated data |
| Technical Rigor | 7/10 | 4/10 | Stats work but data is garbage-in |
| Visualization Quality | 8/10 | 8/10 | Still excellent — the genuine strength |
| Public Translation | 7/10 | 6/10 | Medical claims need disclaimers |
| Publishability (as science) | 6/10 | 3/10 | Not publishable without measured GI data |
| Publishability (as data essay) | — | 8/10 | Submit to The Pudding or Nightingale |

---

## The One-Sentence Verdict

**The visualizations are publication-quality; the science behind them is not.**

Fix the data, reframe the claims, and this becomes an outstanding public-facing data essay. Leave it as-is and it's a beautiful castle built on sand.
