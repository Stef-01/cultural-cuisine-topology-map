import React from 'react'
import ScrollSection from '../components/ScrollSection'
import { DATA_SOURCES } from '../data/constants'

export default function Methodology() {
  return (
    <ScrollSection id="methodology" title="Methodology & Sources">
      {/* Pipeline Visualization */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-8 mb-8">
        <h3 className="text-lg font-semibold mb-6 text-slate-200">Data Pipeline</h3>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex-1 min-w-[100px] text-center">
            <div className="bg-blue-900/30 text-blue-300 px-4 py-3 rounded-lg font-semibold mb-2 text-sm">
              73 Ingredients
            </div>
            <div className="text-xs text-slate-400">Raw ingredient database<br/>per cuisine (6-33 each)</div>
          </div>
          <div className="text-2xl text-slate-600 mx-1">&rarr;</div>
          <div className="flex-1 min-w-[100px] text-center">
            <div className="bg-purple-900/30 text-purple-300 px-4 py-3 rounded-lg font-semibold mb-2 text-sm">
              333 Compounds
            </div>
            <div className="text-xs text-slate-400">FlavorDB2 + FooDB<br/>literature mapping</div>
          </div>
          <div className="text-2xl text-slate-600 mx-1">&rarr;</div>
          <div className="flex-1 min-w-[100px] text-center">
            <div className="bg-green-900/30 text-green-300 px-4 py-3 rounded-lg font-semibold mb-2 text-sm">
              1,932 Meals
            </div>
            <div className="text-xs text-slate-400">10 cuisines<br/>~200 meals each</div>
          </div>
          <div className="text-2xl text-slate-600 mx-1">&rarr;</div>
          <div className="flex-1 min-w-[100px] text-center">
            <div className="bg-orange-900/30 text-orange-300 px-4 py-3 rounded-lg font-semibold mb-2 text-sm">
              Analysis
            </div>
            <div className="text-xs text-slate-400">Jaccard, TDA,<br/>entropy, stats</div>
          </div>
          <div className="text-2xl text-slate-600 mx-1">&rarr;</div>
          <div className="flex-1 min-w-[100px] text-center">
            <div className="bg-red-900/30 text-red-300 px-4 py-3 rounded-lg font-semibold mb-2 text-sm">
              Visualization
            </div>
            <div className="text-xs text-slate-400">D3, Three.js,<br/>interactive panels</div>
          </div>
        </div>
      </div>

      {/* Analytical Methods */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-8 mb-8">
        <h3 className="text-lg font-semibold mb-6 text-slate-200">Analytical Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-700/50 rounded-lg p-5">
            <h4 className="font-semibold text-blue-300 mb-2">Jaccard Similarity</h4>
            <p className="text-xs text-slate-400 mb-2 font-mono">J(A,B) = |A &cap; B| / |A &cup; B|</p>
            <p className="text-sm text-slate-300">
              Pairwise compound set similarity for all 45 cuisine pairs.
              Computed from the actual compound lists (160&ndash;222 compounds per cuisine).
            </p>
          </div>
          <div className="border border-slate-700/50 rounded-lg p-5">
            <h4 className="font-semibold text-purple-300 mb-2">Persistent Homology</h4>
            <p className="text-xs text-slate-400 mb-2 font-mono">&beta;&#x2080;: Union-Find | &beta;&#x2081;: boundary reduction</p>
            <p className="text-sm text-slate-300">
              Vietoris-Rips filtration on Jaccard distances. &beta;&#x2080; tracks component merging (exact),
              &beta;&#x2081; tracks loop formation via boundary matrix reduction (exact).
              <span className="text-amber-400"> Note: n=10 is pedagogically illustrative; for deep
              topological analysis, compound-level TDA (n=333) is recommended.</span>
            </p>
          </div>
          <div className="border border-slate-700/50 rounded-lg p-5">
            <h4 className="font-semibold text-green-300 mb-2">Shannon Entropy</h4>
            <p className="text-xs text-slate-400 mb-2 font-mono">H = -&Sigma;(p&#x1D62; &middot; log&#x2082;(p&#x1D62;))</p>
            <p className="text-sm text-slate-300">
              Per-cuisine measure of compound-sharing diversity. Higher entropy = compounds distributed
              more evenly across sharing levels. Lower entropy = more unique or more universal compounds.
            </p>
          </div>
          <div className="border border-slate-700/50 rounded-lg p-5">
            <h4 className="font-semibold text-orange-300 mb-2">Statistical Inference</h4>
            <p className="text-xs text-slate-400 mb-2 font-mono">Welch&apos;s t-test | Cohen&apos;s d | Bootstrap CI</p>
            <p className="text-sm text-slate-300">
              Traditional vs. modern GI comparison uses Welch&apos;s t-test (unequal variances)
              with Bonferroni correction (&alpha; = 0.005 for 10 comparisons).
              Effect sizes reported as Cohen&apos;s d. 95% confidence intervals via 2,000-iteration
              bootstrap with seeded PRNG for reproducibility.
            </p>
          </div>
        </div>
      </div>

      {/* Traditional vs Modern Classification Rationale */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-8 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Classification: Traditional vs. Modern</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-400 mb-3 text-sm">Traditional (Pre-industrial)</h4>
            <p className="text-sm text-slate-300 mb-3">
              Food preparation methods and ingredients predating industrial food processing (~pre-1950s).
              Aligned with NOVA Group 1&ndash;3 (unprocessed to processed foods).
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>&bull; <strong>Legumes</strong> &mdash; dal, frijoles, natto, foul medames</li>
              <li>&bull; <strong>Vegetables</strong> &mdash; fresh/cooked, universal traditional base</li>
              <li>&bull; <strong>Protein</strong> &mdash; traditional animal protein preparations</li>
              <li>&bull; <strong>Fermented</strong> &mdash; kimchi, miso, injera, yogurt</li>
              <li>&bull; <strong>Soup/Broth</strong> &mdash; foundational cooking method</li>
              <li>&bull; <strong>Dairy</strong> &mdash; yogurt, cheese, buttermilk</li>
              <li>&bull; <strong>Whole Grains</strong> &mdash; teff, millet, quinoa, barley</li>
              <li>&bull; <strong>Salad</strong> &mdash; raw preparations</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-400 mb-3 text-sm">Modern (Post-industrial)</h4>
            <p className="text-sm text-slate-300 mb-3">
              Categories dominated by industrial processing, refined ingredients, or cheap vegetable oils.
              Aligned with NOVA Group 3&ndash;4 (processed to ultra-processed).
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>&bull; <strong>Refined Grains</strong> &mdash; white flour, white rice, instant noodles</li>
              <li>&bull; <strong>Desserts</strong> &mdash; refined-sugar-dense preparations</li>
              <li>&bull; <strong>Deep-fried</strong> &mdash; commercial fryer preparations</li>
              <li>&bull; <strong>Snacks</strong> &mdash; packaged/processed convenience foods</li>
            </ul>
            <div className="mt-4 text-xs text-slate-500 italic">
              Cf. Monteiro et al. (2019) NOVA classification, Public Health Nutr.;
              Popkin (2006) &ldquo;Global nutrition transition&rdquo;, Nutr. Rev.
            </div>
          </div>
        </div>
      </div>

      {/* GI Data Confidence */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-8 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">GI Value Confidence</h3>
        <p className="text-sm text-slate-300 mb-4">
          GI values in this dataset come from three categories with different confidence levels.
          Validation analysis (see <code className="text-slate-300">scripts/validate_gi.py</code>) shows
          that <strong className="text-amber-400">83.2%</strong> of values are estimated and
          <strong className="text-green-400">16.8%</strong> are from published measurements.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-green-800/50 bg-green-900/10 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 text-sm mb-2">Measured (325 meals, 16.8%)</h4>
            <p className="text-xs text-slate-400">
              GI values directly from peer-reviewed sources: PMC7791047 (1,100+ non-Western foods),
              PMC9304465 (Indian foods), PMC9552392 (Indian GI compendium), and the International
              GI Tables. Determined via standardized in-vivo testing protocols.
            </p>
          </div>
          <div className="border border-amber-800/50 bg-amber-900/10 rounded-lg p-4">
            <h4 className="font-semibold text-amber-400 text-sm mb-2">Estimated (1,337 meals, 69.2%)</h4>
            <p className="text-xs text-slate-400">
              Estimated from dominant ingredient category GI ranges (e.g., &ldquo;legume range 22&ndash;38&rdquo;).
              Flagged with &ldquo;est.&rdquo; prefix in gi_ref. The GI Sensitivity table in the Technical tab
              shows per-cuisine impact of excluding these values.
            </p>
          </div>
          <div className="border border-red-800/50 bg-red-900/10 rounded-lg p-4">
            <h4 className="font-semibold text-red-400 text-sm mb-2">GI=0 Proteins (270 meals, 14.0%)</h4>
            <p className="text-xs text-slate-400">
              Pure protein dishes (grilled meat, fish, eggs) assigned GI=0 because protein alone has
              negligible glycemic response. While technically correct for isolated macronutrients,
              this is an oversimplification &mdash; real meals include sides, sauces, and preparation
              methods that affect glycemic response. These should be excluded from GI-centric analyses
              or assigned values based on typical meal context.
            </p>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-8 mb-8">
        <h3 className="text-lg font-semibold mb-6 text-slate-200">Data Sources & Citations</h3>
        <div className="space-y-6">
          {DATA_SOURCES && Array.isArray(DATA_SOURCES) && DATA_SOURCES.map((source, idx) => (
            <div key={idx} className="border-b border-slate-700/50 pb-6 last:border-b-0">
              <h4 className="font-semibold text-slate-200">{source.cite || 'Source'}</h4>
              {source.detail && (
                <p className="text-sm text-slate-400 mt-2">{source.detail}</p>
              )}
              {source.ref && (
                <p className="text-xs text-slate-500 mt-2 italic">{source.ref}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Limitations — expanded and honest */}
      <div className="bg-red-900/10 border-l-4 border-red-500 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-red-300 mb-3">Critical Limitations</h3>
        <ul className="text-sm text-red-200/80 space-y-2">
          <li>&bull; <strong>83% of GI values are estimates.</strong> Only 55 meals (2.8%) have laboratory-measured GI from
          published sources. 1,607 (83.2%) use category-based heuristics. 270 (14%) are GI=0 protein assignments.
          All GI-based conclusions should be treated as hypothesis-generating, not confirmatory.</li>
          <li>&bull; <strong>The traditional/modern GI gap is expected from food science,</strong> not a novel discovery.
          Whole foods have lower GI than processed foods by definition. The novelty is mapping this across 10 diverse cuisines, not the finding itself.</li>
          <li>&bull; <strong>Jaccard similarity treats compounds as binary</strong> (present/absent) without concentration,
          abundance, or sensory threshold data. A trace compound and a dominant compound receive equal weight.
          Cosine similarity is provided as a complementary metric.</li>
        </ul>
      </div>

      <div className="bg-amber-900/20 border-l-4 border-amber-500 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-amber-300 mb-3">Additional Limitations</h3>
        <ul className="text-sm text-amber-200/90 space-y-2">
          <li>&bull; <strong>Cuisine selection bias:</strong> 10 cuisines were hand-selected for diversity and GI data availability.
          Missing: Chinese (1.4B people), Indonesian, Brazilian, Turkish, French, Nigerian (distinct from West African).
          Results may not generalize to unrepresented culinary traditions.</li>
          <li>&bull; Compound data is from published flavor chemistry databases (FlavorDB2, FooDB, Ahn et al.);
          not all constituents are captured. Cooking methods (Maillard reaction, thermal degradation, fermentation)
          alter compound profiles significantly but are not modeled.</li>
          <li>&bull; The ingredient&ndash;compound co-occurrence diagram shows statistical association, not biochemical causation.
          An ingredient linked to a compound means they appear in the same cuisine, not that the ingredient produces that compound.</li>
          <li>&bull; Topological data analysis on n=10 cuisines is <strong>pedagogically illustrative only</strong>.
          With 10 points, the Rips complex is too small for meaningful topological features.
          The dendrogram (UPGMA) is the primary analytical visualization for cuisine-level structure.</li>
          <li>&bull; This is an <strong>educational tool, not medical advice</strong>. GI does not account for portion size,
          food combining, cooking method, or individual insulin sensitivity. Consult a registered dietitian.</li>
        </ul>
      </div>

      {/* Reproducibility */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="font-semibold text-slate-200 mb-3">Reproducibility</h3>
        <p className="text-sm text-slate-400">
          All analytical computations (Jaccard similarity, persistence diagrams, Betti numbers,
          Shannon entropy, statistical tests) are performed client-side from the raw dataset
          in <code className="text-slate-300">src/data/cuisines.json</code>. The computation
          code is in <code className="text-slate-300">src/data/computed.js</code>. Bootstrap
          confidence intervals use a seeded PRNG (seed=42) for deterministic results.
          The full source code and dataset are available in this repository.
        </p>
      </div>
    </ScrollSection>
  )
}
