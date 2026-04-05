# Cuisine Topology Visualization Components

This directory contains 10 React visualization components for the Vite + React + Tailwind + D3.js cuisine topology analysis app.

## Component Overview

### 1. **ForceNetwork** (`ForceNetwork.jsx`)
Interactive D3 force-directed network of 10 cuisine nodes.

**Features:**
- D3 force simulation with link strength based on Jaccard similarity
- Node size proportional to compound count
- Glow filter on hover
- Connected edge highlighting
- Search box to filter/highlight nodes
- Legend showing cuisine colors
- Clickable nodes to select cuisine

**Props:** None (uses global store for selection state)

**Size:** 100% width, 600px height

---

### 2. **HeatmapChart** (`HeatmapChart.jsx`)
Interactive Jaccard similarity heatmap (10x10 grid).

**Features:**
- White → deep blue color scale (0 → 0.8+)
- Hover tooltips with pair name, Jaccard value, shared compound count
- Click to show detailed overlay with shared compounds
- Cuisine names in their colors on axes
- Diagonal cells display "1.00" in muted text

**Props:** None

**Size:** Auto-fit width, maintains square cells

---

### 3. **BeeswarmChart** (`BeeswarmChart.jsx`)
GI distribution beeswarm plot with D3 force collision avoidance.

**Features:**
- Circles positioned along GI axis (0-100)
- Colors by GI zone (green/yellow/orange/red)
- Vertical jitter via force simulation
- GI zone background bands
- Hover tooltips: meal name, GI value, category, reference
- Can show single cuisine or all

**Props:**
- `cuisineId` (string | null): If provided, shows only that cuisine's meals. If null, shows all cuisines.

**Size:** Responsive width, 300px height

---

### 4. **PersistenceDiagram** (`PersistenceDiagram.jsx`)
TDA persistence diagram of flavor compound topology.

**Features:**
- Scatter plot: x = birth, y = death (both in Jaccard distance units)
- β₀ features (connected components) as blue circles
- β₁ features (loops) as orange triangles
- Diagonal reference line (birth = death)
- Features with death = ∞ shown at top with star marker
- Properly labeled axes
- Title and footer with data source info

**Props:** None

**Size:** 400x400 fixed

---

### 5. **BettiChart** (`BettiChart.jsx`)
Betti numbers by filtration threshold.

**Features:**
- Grouped bar chart: x = threshold (0.1-0.8), y = count
- β₀ in blue, β₁ in orange
- Legend
- Hover tooltips

**Props:** None

**Size:** Responsive width, 300px height

---

### 6. **EntropyChart** (`EntropyChart.jsx`)
Shannon entropy horizontal bar chart, sorted descending.

**Features:**
- Horizontal bars, one per cuisine
- Bar color = cuisine color
- Cuisine names on left (their color), entropy value on right (2 decimals)
- Bar length proportional to entropy

**Props:** None

**Size:** Responsive width, 400px height

---

### 7. **DumbbellChart** (`DumbbellChart.jsx`)
Traditional vs Modern GI dumbbell chart.

**Features:**
- One row per cuisine
- Horizontal GI axis (0-100) with zone background bands
- Green dot: traditional avg GI
- Orange/red dot: modern avg GI
- Dashed line connecting the two dots
- Gap value labeled between dots
- Cuisine names on left in their color
- Legend

**Props:** None

**Size:** Responsive width, 400px height

---

### 8. **RadarChart** (`RadarChart.jsx`)
Flavor fingerprint radar/spider chart showing compound family percentages.

**Features:**
- 8 axes: terpenes, sulfides, aldehydes, phenolics, lactones, pyrazines, acids, other
- Filled polygon with cuisine color at 30% opacity
- Radial grid with level labels
- Can overlay multiple cuisines for comparison
- Hover tooltips

**Props:**
- `cuisineId` (string): Primary cuisine to display
- `compareIds` (array): Optional additional cuisines to overlay

**Size:** 350x350 fixed

---

### 9. **TreemapChart** (`TreemapChart.jsx`)
Compound frequency treemap using D3 treemap layout.

**Features:**
- Outer rectangles = compound families (with colored borders)
- Inner rectangles = individual compounds, sized by cuisine count
- Family-based color scheme
- Hover shows compound name, family, cuisine count
- Labels on larger rectangles

**Props:** None

**Size:** Responsive width, 400px height

---

### 10. **ParticleField** (`ParticleField.jsx`)
Three.js particle field for background decoration.

**Features:**
- 150 floating particles in 3D space
- Warm color palette: #d4a574, #c8956a, #a89f94
- Slow drift animation with velocity constraints
- Very small point size (0.015)
- Transparent background (alpha: true)
- Positioned absolutely behind content

**Props:** None

**Usage:**
```jsx
<div className="relative">
  <ParticleField />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>
```

---

## Shared Styling

All components use the app's color scheme:
- **Dark background:** #0a0a0f or transparent
- **Warm accent:** #d4a574
- **Text:** #e8e4dd
- **Dim text:** #a89f94

## Data Dependencies

All components import from:
- `../data/computed.js` - Analysis functions and computed values
- `../data/constants.js` - Color maps, cuisine names, compound families, GI zones
- `../store.js` - Zustand store for shared state (hoveredCuisine, selectedCuisine, etc.)

## Usage Example

```jsx
import {
  ForceNetwork,
  HeatmapChart,
  BeeswarmChart,
  PersistenceDiagram,
  BettiChart,
  EntropyChart,
  DumbbellChart,
  RadarChart,
  TreemapChart,
  ParticleField,
} from './viz'

export default function VisualizationDashboard() {
  return (
    <div className="space-y-6 p-6 bg-gray-950">
      <div className="relative">
        <ParticleField />
        <div className="relative z-10">
          <h1>Cuisine Topology Analysis</h1>
          <ForceNetwork />
          <HeatmapChart />
          <BeeswarmChart cuisineId="indian" />
          <div className="grid grid-cols-2 gap-6">
            <PersistenceDiagram />
            <BettiChart />
          </div>
          <EntropyChart />
          <DumbbellChart />
          <RadarChart cuisineId="thai" compareIds={['indian', 'mexican']} />
          <TreemapChart />
        </div>
      </div>
    </div>
  )
}
```

## Dependencies

- `react` - UI framework
- `d3` - Data visualization
- `three` - 3D graphics
- `@react-three/fiber` - React renderer for Three.js
- `zustand` - State management
- `tailwindcss` - Styling

## Notes

- All SVG components are responsive to container width
- Tooltips use fixed positioning and appear near the cursor
- Force simulations include proper cleanup in useEffect
- Color interpolation helpers are included in ForceNetwork
- All components handle empty or missing data gracefully
