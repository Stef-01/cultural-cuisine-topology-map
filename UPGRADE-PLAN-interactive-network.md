# Upgrade Plan: Reintroducing the Living Flavor Network

## What Was Lost

The original HTML had a **Canvas-based force network** that felt alive — particles flowing along edges like molecules traveling between cuisines, nodes pulsing with a sinusoidal glow, and hovering on any cuisine would instantly reveal its compound bridges to neighbors with actual compound names visible. The React migration replaced this with a standard D3 SVG force layout that has the topology but none of the life.

### Specific features that disappeared:

| Feature | Original HTML | Current React |
|---|---|---|
| **Edge particles** | 1-3 particles per edge flowing continuously, count proportional to Jaccard | None |
| **Pulsing glow** | `sin(time * 0.05) * 0.3` sinusoidal halo around hovered node | Static SVG filter (barely visible) |
| **Arc gauge** | Circular progress ring around each node showing compound count / max | None |
| **Compound bridge panel** | Hover a node → see top 3 bridges with actual compound names (e.g., "Cumin + Turmeric share: Linalool, Cuminaldehyde, α-Pinene...") | Hover only dims/highlights opacity |
| **Custom physics** | Hand-tuned damping (0.98), repulsion (1500), center pull (0.1) — felt organic | D3 defaults — feels mechanical |
| **Canvas rendering** | 60fps smooth, handles particles + glow + physics in one frame | SVG DOM manipulation — no frame-level animation |

## The Core Problem

SVG is the wrong medium for this visualization. SVG is great for static charts (heatmap, bar charts, persistence diagrams), but for a network that needs to feel **alive** — with flowing particles, per-frame glow animation, and 60fps interactivity — Canvas is the right tool.

## Plan: Hybrid Canvas + React Architecture

### Phase 1: Replace ForceNetwork.jsx with a Canvas-based component

**New file: `src/viz/FlavorNetworkCanvas.jsx`**

A React component that manages a `<canvas>` element and runs its own animation loop. React handles the outer chrome (search bar, legend, info panel), Canvas handles the visualization.

```
┌─────────────────────────────────────────────────┐
│ React Component (FlavorNetworkCanvas)            │
│ ┌─────────────────────────────────────────────┐  │
│ │ Search bar (React)                          │  │
│ └─────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────┐  │
│ │ <canvas> — managed by class NetworkEngine   │  │
│ │                                             │  │
│ │  ● Nodes with arc gauges + pulsing glow     │  │
│ │  ─ Edges with flowing particles             │  │
│ │  ─ Bezier curves, opacity by Jaccard        │  │
│ │                                             │  │
│ └─────────────────────────────────────────────┘  │
│ ┌────────────────┐ ┌──────────────────────────┐  │
│ │ Legend (React)  │ │ Bridge Panel (React)     │  │
│ │ 10 cuisine dots │ │ Shows shared compounds   │  │
│ └────────────────┘ │ when hovering a node     │  │
│                    └──────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Phase 2: NetworkEngine class (pure JS, no React)

A standalone class that owns the Canvas context and animation loop. React creates/destroys it via useEffect.

**Key methods:**

```
class NetworkEngine {
  constructor(canvas, data, callbacks)

  // Setup
  initNodes()           // Position 10 cuisine nodes on circle
  initEdges()           // Build from sortedPairs (top 25-30)
  initParticles()       // 1-3 particles per edge based on Jaccard

  // Physics (custom, not D3)
  simulate()            // Per-frame: repulsion, attraction, edge spring, damping
  applyRepulsion()      // Coulomb's law between all node pairs
  applyEdgeForces()     // Spring force along edges, k proportional to Jaccard
  applyCenterPull()     // Gentle attraction toward canvas center
  applyDamping(0.97)    // Velocity decay

  // Rendering (per frame)
  draw()
  drawEdges()           // Quadratic bezier curves, opacity by Jaccard
  drawParticles()       // Flowing dots along edges
  drawNodes()           // Filled circles with cuisine color
  drawArcGauges()       // Circular progress ring (compound count / max)
  drawGlow(node)        // Sinusoidal pulsing halo: alpha = 0.5 + sin(t * 0.05) * 0.3
  drawLabels()          // Cuisine names below nodes
  drawHoverBridges()    // When hovering: show compound names on connected edges

  // Interaction
  onMouseMove(e)        // Hit detection, hover state, cursor feedback
  onMouseDown(e)        // Start drag
  onMouseUp(e)          // End drag, handle click selection
  onMouseLeave()        // Clear hover

  // Animation loop
  start()               // requestAnimationFrame loop
  stop()                // Cancel animation

  // Bridge to React
  onNodeHover(callback)   // Fires when hover changes → React updates info panel
  onNodeSelect(callback)  // Fires on click → React updates bridge panel
}
```

### Phase 3: The Compound Bridge Panel

This is the killer feature that was lost. When you hover or click a cuisine node, a panel appears showing:

```
┌──────────────────────────────────────────┐
│ 🇮🇳 Indian                                │
│ 204 meals · 187 compounds · 28 ingredients│
│                                          │
│ Top Compound Bridges:                    │
│                                          │
│ ↔ Ethiopian (J = 79.0%)                  │
│   Shared: Linalool, Cuminaldehyde,       │
│   α-Pinene, Eugenol, Capsaicin,         │
│   Fenugreek lactone, Curcumin            │
│   ... +42 more                           │
│                                          │
│ ↔ Thai (J = 62.3%)                       │
│   Shared: Linalool, Citral, Geraniol,    │
│   Capsaicin, Galangal terpenes           │
│   ... +31 more                           │
│                                          │
│ ↔ Middle Eastern (J = 58.7%)             │
│   Shared: Cuminaldehyde, α-Pinene,       │
│   Sesame compounds, Linalool             │
│   ... +28 more                           │
└──────────────────────────────────────────┘
```

This panel is a **React component** that reads from the Zustand store (hoveredCuisine/selectedCuisine) and renders the overlap data from `getOverlap()`.

### Phase 4: Visual Polish — What Makes It Feel Alive

**4a. Edge Particles**
- Each edge gets `Math.ceil(jaccard * 3)` particles
- Particles travel along the bezier curve at speed `0.008 + jaccard * 0.004`
- Particle size: `2 + Math.random() * 2` px
- Particle color: source cuisine color, alpha `0.5-0.7`
- When a node is hovered, particles on its edges accelerate (speed × 2) and glow brighter

**4b. Node Glow**
- Default: subtle radial gradient halo, alpha 0.15
- Hovered: pulsing glow with `alpha = 0.4 + sin(frame * 0.05) * 0.25`
- Selected: solid gold ring (`#d4a574`, 3px stroke)
- Unrelated nodes when one is hovered: dim to alpha 0.3

**4c. Arc Gauge**
- Thin (2px) arc drawn from -π/2 clockwise
- Length = `(node.compoundCount / maxCompoundCount) * 2π`
- Color: `#d4a574` at 0.5 alpha
- Acts as a "how complex is this cuisine's flavor profile" visual hint

**4d. Edge Hover Labels**
- When a node is hovered, each connected edge shows its Jaccard % at the midpoint of the bezier
- Font: 9px, color: `#d4a574`
- Positioned at the control point of the quadratic bezier

**4e. Compound Name Tooltips on Edges**
- When hovering directly over an edge (not a node), show a tooltip with the shared compound names
- Hit detection: distance from mouse to nearest point on bezier curve < 8px

### Phase 5: Integration

**TopologyExplorer.jsx changes:**
- Replace `<ForceNetwork />` with `<FlavorNetworkCanvas />`
- Add the Bridge Panel as a sibling component that reads from store
- The network tab becomes a full-width immersive view (not constrained to `h-96`)

**Store additions:**
- `hoveredBridges: []` — array of { cuisineId, jaccard, sharedCompounds } for the hovered node
- `setHoveredBridges(bridges)`

**Data additions (computed.js):**
- `getBridgesForCuisine(cuisineId)` — returns sorted array of { otherCuisine, jaccard, sharedCompounds, sharedCount } for all connections of a given cuisine

## File Changes Summary

| File | Action | Why |
|---|---|---|
| `src/viz/FlavorNetworkCanvas.jsx` | **NEW** | Canvas-based network with particles, glow, arc gauges |
| `src/viz/NetworkEngine.js` | **NEW** | Pure JS engine class (no React dependency) |
| `src/viz/ForceNetwork.jsx` | **DELETE** or rename to `ForceNetwork.legacy.jsx` | Replaced by Canvas version |
| `src/sections/TopologyExplorer.jsx` | **EDIT** | Import FlavorNetworkCanvas, add BridgePanel, widen network view |
| `src/components/BridgePanel.jsx` | **NEW** | Shows compound bridges for hovered/selected cuisine |
| `src/data/computed.js` | **EDIT** | Add `getBridgesForCuisine()` helper |
| `src/store.js` | **EDIT** | Add `hoveredBridges` state |

## Estimated Complexity

- **NetworkEngine.js**: ~350 lines (physics + rendering + interaction)
- **FlavorNetworkCanvas.jsx**: ~120 lines (React wrapper, effects, cleanup)
- **BridgePanel.jsx**: ~80 lines (compound bridge display)
- **TopologyExplorer.jsx edits**: ~30 lines changed
- **computed.js/store.js edits**: ~20 lines each

**Total: ~600 lines of new/modified code**

## What This Achieves

The network goes from "a chart you look at" to "a living system you explore." The particles make you feel like flavor molecules are literally traveling between cuisines. The pulsing glow draws your eye to connections. The bridge panel turns abstract Jaccard numbers into concrete "oh, Indian and Ethiopian food share cumin, fenugreek, and turmeric compounds — that's why they taste related."

That's the thesis of the whole project made tangible through interaction.
