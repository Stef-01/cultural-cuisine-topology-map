# Quick Start Guide: Cuisine Topology Visualizations

## Installation

All components are ready to use. Ensure your dependencies include:
```bash
npm install d3 three @react-three/fiber zustand
```

## Import Examples

### Import all components at once:
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
```

### Or import individually:
```jsx
import ForceNetwork from './viz/ForceNetwork'
import RadarChart from './viz/RadarChart'
```

## Component Quick Reference

| Component | Props | Size | Interactive |
|-----------|-------|------|-------------|
| ForceNetwork | None | 100% × 600px | Yes (click, search) |
| HeatmapChart | None | Auto × Auto | Yes (hover, click) |
| BeeswarmChart | `cuisineId?` | 100% × 300px | Yes (hover) |
| PersistenceDiagram | None | 400 × 400 | Yes (hover) |
| BettiChart | None | 100% × 300px | Yes (hover) |
| EntropyChart | None | 100% × 400px | Yes (hover) |
| DumbbellChart | None | 100% × 400px | Yes (hover) |
| RadarChart | `cuisineId?`, `compareIds?` | 350 × 350 | Yes (hover) |
| TreemapChart | None | 100% × 400px | Yes (hover) |
| ParticleField | None | Full screen | Animation only |

## Usage Patterns

### Show all cuisines in beeswarm:
```jsx
<BeeswarmChart />
```

### Show specific cuisine in beeswarm:
```jsx
<BeeswarmChart cuisineId="indian" />
```

### Compare multiple cuisines in radar:
```jsx
<RadarChart cuisineId="thai" compareIds={['indian', 'mexican']} />
```

### Use particle field as background:
```jsx
<div className="relative h-screen">
  <ParticleField />
  <div className="relative z-10 p-6">
    {/* Your content here */}
  </div>
</div>
```

### Full dashboard layout:
```jsx
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="relative">
        <ParticleField />
        <div className="relative z-10 space-y-6 p-6">
          <h1 className="text-4xl font-bold">Cuisine Topology</h1>

          <section>
            <h2 className="text-2xl mb-4">Network Analysis</h2>
            <ForceNetwork />
          </section>

          <section>
            <h2 className="text-2xl mb-4">Similarity Matrix</h2>
            <HeatmapChart />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section>
              <h3 className="text-xl mb-4">Persistence Diagram</h3>
              <PersistenceDiagram />
            </section>
            <section>
              <h3 className="text-xl mb-4">Betti Numbers</h3>
              <BettiChart />
            </section>
          </div>

          <section>
            <h2 className="text-2xl mb-4">Flavor Fingerprints</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RadarChart cuisineId="indian" compareIds={['thai', 'mexican']} />
              <RadarChart cuisineId="mediterranean" compareIds={['mexican']} />
            </div>
          </section>

          <section>
            <h2 className="text-2xl mb-4">Culinary Metrics</h2>
            <EntropyChart />
            <DumbbellChart />
          </section>

          <section>
            <h2 className="text-2xl mb-4">Compound Analysis</h2>
            <TreemapChart />
          </section>

          <section>
            <h2 className="text-2xl mb-4">GI Distribution</h2>
            <BeeswarmChart cuisineId="indian" />
          </section>
        </div>
      </div>
    </div>
  )
}
```

## Data Flow

All components read from:
1. **`computed.js`** - Analysis functions
   - `getJaccard(a, b)` - Jaccard similarity
   - `computePersistenceDiagram()` - TDA results
   - `computeBettiNumbers()` - Topological features
   - `computeEntropyPerCuisine()` - Shannon entropy
   - `computeFlavorFingerprints()` - Compound family percentages
   - `computeTraditionalVsModern()` - GI comparison
   - `computeUniversalCompounds()` - Frequency analysis
   - `getGIDistribution(cuisineId)` - Meal-level data

2. **`constants.js`** - Mapping tables
   - `CUISINE_COLORS` - Cuisine → color
   - `CUISINE_NAMES` - Cuisine → display name
   - `COMPOUND_FAMILIES` - Family definitions
   - `GI_ZONES` - Color ranges for GI

3. **`store.js`** - Global state
   - `hoveredCuisine` - Currently hovered cuisine
   - `selectedCuisine` - Currently selected cuisine

## Styling

All components respect the app's color scheme:
- **Background:** `#0a0a0f` (dark)
- **Text:** `#e8e4dd` (light beige)
- **Dim text:** `#a89f94` (gray)
- **Accent:** `#d4a574` (warm gold)

For Tailwind classes, these map to:
- `bg-gray-950` → `#0a0a0f`
- `text-gray-100` → `#e8e4dd`
- `border-gray-700/800` → Subtle borders

## Troubleshooting

### Tooltips appear off-screen
- Ensure containers have `position: relative`
- Add `overflow: visible` if needed

### Force network jittering
- This is normal; the simulation runs for 100+ ticks
- Use `simulation.stop()` if you need to freeze

### Radar chart not showing
- Check that `computeFlavorFingerprints()` returns data
- Ensure cuisine ID exists in dataset

### Particles not visible
- ParticleField must have `z-0` and be behind content with `z-10`
- Set Canvas `transparent: true`

## Performance Notes

- **ForceNetwork:** Real-time updates (use search sparingly with large datasets)
- **HeatmapChart:** O(n²) cells, fine for 10 cuisines
- **ParticleField:** ~150 particles, runs at 60 FPS
- **TreemapChart:** Auto-culls to top 15 compounds per family

All components clean up properly on unmount.

## Development

See `COMPONENTS.md` for detailed specifications of each component.
