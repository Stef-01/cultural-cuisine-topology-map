# Cultural Cuisine Topology Map — System Architecture

## Vision
A multi-dimensional, interactive data exploration platform that reveals the hidden molecular geography of world cuisines and their glycemic impact. Built as a proper web application with 3D visualization, scrollytelling narrative, and clinical utility.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Build | Vite 5 | Fast HMR, native ESM, tiny bundles |
| UI Framework | React 18 | Component architecture, hooks for state |
| 3D Rendering | Three.js + @react-three/fiber + @react-three/drei | WebGL globe, 3D force graph, particle systems |
| 2D Charts | D3.js v7 | Force-directed network, heatmaps, dot plots |
| Animation | Framer Motion + GSAP | Scroll-triggered reveals, microinteractions |
| Scrollytelling | Custom IntersectionObserver engine | Section-based narrative progression |
| Styling | Tailwind CSS 3 | Utility-first, dark theme, responsive |
| State | Zustand | Lightweight global state for selected cuisine, active panel, filters |
| Data | Static JSON + computed modules | Pre-computed Jaccard, TDA, entropy at build time |

## Page Architecture (Single-Page, Scroll-Driven)

```
┌─────────────────────────────────────────────────────┐
│  SECTION 0: Nav Bar (sticky, translucent)           │
│  - Logo + title                                     │
│  - Section dots (scroll progress indicator)         │
│  - "Explore" / "Clinical Tool" quick links          │
├─────────────────────────────────────────────────────┤
│  SECTION 1: Hero (fullscreen)                       │
│  - Animated particle background (Three.js)          │
│  - Title with typewriter reveal                     │
│  - Animated stat counters                           │
│  - Scroll-down chevron                              │
├─────────────────────────────────────────────────────┤
│  SECTION 2: The Problem (scroll-triggered)          │
│  - Mediterranean bias narrative                     │
│  - Animated "85% of the world" donut chart          │
│  - Before/After comparison cards                    │
├─────────────────────────────────────────────────────┤
│  SECTION 3: The Molecular Globe (sticky + scroll)   │
│  - 3D rotating globe with cuisine nodes at          │
│    geographic positions                             │
│  - Arcs connecting cuisines (Jaccard similarity)    │
│  - Scroll controls rotation + zoom                  │
│  - Click node → fly-to + detail panel               │
│  - Particle streams along arcs (shared compounds)   │
├─────────────────────────────────────────────────────┤
│  SECTION 4: The Topology Explorer (tab-based)       │
│  ┌───────────┬──────────────┬────────────┐          │
│  │ Network   │ Public-Facing │ Technical  │          │
│  ├───────────┴──────────────┴────────────┤          │
│  │ Tab 1: Interactive D3 force network   │          │
│  │   - Drag, hover, zoom, filter         │          │
│  │   - Edge particles, glow effects      │          │
│  │   - Compound search + highlight       │          │
│  │ Tab 2: Publication panels             │          │
│  │   - Persistence diagram (computed)    │          │
│  │   - Betti numbers (computed)          │          │
│  │   - Shannon entropy bars              │          │
│  │   - Molecular bridge detail           │          │
│  │ Tab 3: Technical deep-dive            │          │
│  │   - Jaccard heatmap (interactive)     │          │
│  │   - GI distribution beeswarm          │          │
│  │   - Compound frequency treemap        │          │
│  │   - Statistics dashboard              │          │
│  └───────────────────────────────────────┘          │
├─────────────────────────────────────────────────────┤
│  SECTION 5: Compound Deep Dive                      │
│  - Searchable compound explorer                     │
│  - Select a compound → see which cuisines use it    │
│  - Ingredient→compound→cuisine Sankey diagram       │
│  - "Flavor fingerprint" radar charts per cuisine    │
├─────────────────────────────────────────────────────┤
│  SECTION 6: Clinical Tool                           │
│  - Cuisine selector (cards, not dropdown)           │
│  - GI spectrum visualization (beeswarm)             │
│  - Filter by category, sort by GI                   │
│  - Meal cards with expand for full detail            │
│  - "Build a Low-GI Plate" interactive tool          │
│  - Export/print meal plan                           │
├─────────────────────────────────────────────────────┤
│  SECTION 7: Your Grandmother Was Right (The Moat)   │
│  - Traditional vs Modern GI dumbbell chart          │
│  - Animated transition showing the "gap"            │
│  - Per-cuisine storytelling cards                   │
│  - Community recipe submission CTA                  │
├─────────────────────────────────────────────────────┤
│  SECTION 8: Methodology + Sources                   │
│  - Data pipeline visualization                      │
│  - Source citations with DOI links                  │
│  - Limitations disclosure                           │
│  - GitHub link                                      │
└─────────────────────────────────────────────────────┘
```

## Directory Structure

```
cuisine-topology/
├── index.html                    # Entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── data/
│       ├── cuisines.json         # Full dataset (all compounds, meals, overlaps)
│       └── geo.json              # Cuisine geographic coordinates
├── src/
│   ├── main.jsx                  # App entry, router
│   ├── App.jsx                   # Layout + scroll engine
│   ├── index.css                 # Tailwind imports + custom dark theme
│   ├── store.js                  # Zustand global state
│   ├── data/
│   │   ├── cuisines.json         # Embedded dataset
│   │   ├── computed.js           # Jaccard, TDA, entropy computations
│   │   └── constants.js          # Colors, names, categories, geo coords
│   ├── components/
│   │   ├── Nav.jsx               # Sticky nav with scroll progress
│   │   ├── ScrollSection.jsx     # IntersectionObserver wrapper
│   │   ├── AnimatedCounter.jsx   # Number counting animation
│   │   └── TabPanel.jsx          # Reusable tab container
│   ├── sections/
│   │   ├── Hero.jsx              # Section 1: Hero with particle bg
│   │   ├── Problem.jsx           # Section 2: Mediterranean bias
│   │   ├── Globe.jsx             # Section 3: 3D molecular globe
│   │   ├── TopologyExplorer.jsx  # Section 4: Tabbed explorer
│   │   ├── CompoundDive.jsx      # Section 5: Compound deep dive
│   │   ├── ClinicalTool.jsx      # Section 6: GI food finder
│   │   ├── Moat.jsx              # Section 7: Grandmother thesis
│   │   └── Methodology.jsx       # Section 8: Sources
│   ├── viz/
│   │   ├── ForceNetwork.jsx      # D3 force-directed cuisine graph
│   │   ├── GlobeViz.jsx          # Three.js globe with arcs
│   │   ├── HeatmapChart.jsx      # Interactive Jaccard heatmap
│   │   ├── BeeswarmChart.jsx     # GI distribution beeswarm
│   │   ├── PersistenceDiagram.jsx# TDA persistence diagram
│   │   ├── BettiChart.jsx        # Betti numbers by threshold
│   │   ├── EntropyChart.jsx      # Shannon entropy comparison
│   │   ├── DumbbellChart.jsx     # Traditional vs Modern GI
│   │   ├── RadarChart.jsx        # Flavor fingerprint radar
│   │   ├── SankeyDiagram.jsx     # Ingredient→compound→cuisine flow
│   │   ├── TreemapChart.jsx      # Compound frequency treemap
│   │   └── ParticleField.jsx     # Background particle effect
│   └── hooks/
│       ├── useScrollProgress.js  # Scroll position tracking
│       ├── useInView.js          # IntersectionObserver hook
│       └── useAnimatedValue.js   # Spring-based number animation
└── README.md
```

## New Visualization Dimensions (Beyond the HTML version)

1. **3D Globe** — Cuisines placed at geographic coordinates, connected by Jaccard arcs. Particle streams show molecular flow. Scroll-driven rotation.

2. **Beeswarm GI Plot** — Every meal as a physics-simulated dot on a GI axis, with collision avoidance. Far richer than the current stacked dot plot.

3. **Compound Frequency Treemap** — Nested rectangles: outer = compound family (terpenes, sulfides, aldehydes, phenolics, etc.), inner = individual compounds. Size = number of cuisines sharing it.

4. **Sankey Diagram** — Flow from ingredients → compounds → cuisines. Shows how cumin's Cuminaldehyde flows into Indian, Mexican, Ethiopian, Middle Eastern.

5. **Radar/Spider Charts** — "Flavor fingerprint" per cuisine showing compound family proportions (% terpenes, % sulfides, % aldehydes, % phenolics, % lactones, % pyrazines).

6. **Interactive Heatmap** — Click any cell to see the shared compounds list. Hover shows tooltip. Sort by any row/column.

7. **"Build a Plate" Tool** — Drag foods from a cuisine's list onto a virtual plate. See the combined GI estimate, compound diversity score, and flavor pairing compatibility in real-time.

## Data Computation Pipeline

```
Raw ingredients (73) × compound mappings (333 named, 3601 total)
        ↓
Cuisine compound sets (10 cuisines × 160-222 compounds each)
        ↓
┌─────────────────┬────────────────────┬──────────────────┐
│ Jaccard Matrix   │ TDA/Persistence    │ Shannon Entropy   │
│ 45 pairs         │ Vietoris-Rips      │ Per-cuisine       │
│ Real computed     │ from Jaccard dist  │ compound sharing  │
└─────────────────┴────────────────────┴──────────────────┘
        ↓
1,932 meals with GI values, categories, compound counts
        ↓
Traditional vs Modern GI comparison per cuisine
```
