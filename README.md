# Cultural Cuisine Topology Map

Multi-dimensional interactive visualization of flavor molecule diversity and glycemic impact across world cuisines.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run preview
```

## What This Is

A scrollytelling data visualization that reveals the hidden molecular geography of 10 world cuisines and their glycemic impact — making the case that culturally authentic foods already contain the answers to diabetes management, without abandoning culinary identity.

### Data Scale

- **1,932 meals** across 10 cuisines (~200 per cuisine)
- **333 named flavor compounds** mapped from 73 ingredients
- **3,601+ total compounds** referenced from published literature
- **45 pairwise Jaccard similarities** computed from real compound set intersections
- GI values from PMC7791047 (1,100+ non-Western foods), PMC9304465, PMC9552392

### Sections

1. **Hero** — Animated particle background, stat counters
2. **The Problem** — Mediterranean diet bias, before/after comparison
3. **Molecular Globe** — 3D WebGL globe with cuisine nodes and Jaccard arcs
4. **Topology Explorer** — Three-tabbed interactive explorer:
   - Interactive D3 force network (drag, hover, search)
   - Public-facing panels (persistence diagram, Betti numbers, Shannon entropy, molecular bridges)
   - Technical panels (Jaccard heatmap, GI beeswarm, compound treemap, stats table)
5. **Compound Deep Dive** — Search compounds, see cross-cuisine fingerprints
6. **Clinical Tool** — Find your culture's best low-GI foods
7. **Your Grandmother Was Right** — Traditional vs modern GI dumbbell chart
8. **Methodology** — Data pipeline, sources, limitations

### Tech Stack

React 18, Vite 5, Three.js + React Three Fiber, D3.js v7, Framer Motion, Zustand, Tailwind CSS

### Data Sources

- FlavorDB2 (Goel et al. 2024)
- FooDB (70,926 compounds)
- Ahn et al. 2011 (Sci. Rep.)
- Jain et al. 2015 (Indian cuisine)
- PMC7791047, PMC9304465, PMC9552392, PMC9570555, PMC6966211
