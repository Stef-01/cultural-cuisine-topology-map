import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import { useRef, useEffect, useState, useMemo, lazy, Suspense } from 'react'
import * as THREE from 'three'
import ScrollSection from '../components/ScrollSection'
import useStore from '../store'
import { CUISINE_COLORS, CUISINE_NAMES, CUISINE_GEO } from '../data/constants'
import { cuisineIds, sortedPairs, getJaccard, cuisineSummaries } from '../data/computed'

/**
 * Detect if we should use the 2D fallback:
 * - Mobile/small screens (width < 768)
 * - No WebGL support
 */
function shouldUseFallback() {
  if (typeof window === 'undefined') return true
  if (window.innerWidth < 768) return true
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !gl
  } catch {
    return true
  }
}

/**
 * Convert lat/lng to 3D sphere position
 */
function latLngToVector3(lat, lng, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = radius * Math.sin(phi) * Math.cos(theta)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

/**
 * Cuisine node component (glowing sphere at geo position)
 */
function CuisineNode({ id, position, color }) {
  const meshRef = useRef(null)
  const selectedCuisine = useStore((s) => s.selectedCuisine)
  const hoveredCuisine = useStore((s) => s.hoveredCuisine)
  const setSelectedCuisine = useStore((s) => s.setSelectedCuisine)
  const setGlobeAutoRotate = useStore((s) => s.setGlobeAutoRotate)

  const isSelected = selectedCuisine === id
  const isHovered = hoveredCuisine === id

  useFrame(() => {
    if (meshRef.current) {
      const scale = isSelected ? 1.5 : isHovered ? 1.2 : 1.0
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    }
  })

  const handleClick = () => {
    setSelectedCuisine(id)
    setGlobeAutoRotate(false)
  }

  return (
    <mesh ref={meshRef} position={position} onClick={handleClick}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshPhongMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isSelected ? 0.8 : isHovered ? 0.5 : 0.3}
        shininess={100}
      />
    </mesh>
  )
}

/**
 * Arc between two cuisines with Jaccard similarity
 */
function CuisineArc({ from, to, jaccard, color1, color2 }) {
  const midpoint = from.clone().add(to).multiplyScalar(0.5)
  const offset = 3 - jaccard * 2 // Lower Jaccard = higher arc
  midpoint.normalize().multiplyScalar(2.2 + offset * 0.3)

  // Create quadratic bezier curve
  const curve = new THREE.QuadraticBezierCurve3(from, midpoint, to)
  const points = curve.getPoints(32)

  // Blend colors
  const c1 = new THREE.Color(color1)
  const c2 = new THREE.Color(color2)
  const blendColor = c1.lerp(c2, 0.5)

  return (
    <Line
      points={points}
      color={blendColor}
      lineWidth={1 + jaccard * 2}
      transparent
      opacity={0.3 + jaccard * 0.4}
    />
  )
}

/**
 * Globe visualization with interactive nodes and arcs
 */
function GlobeVisualization() {
  const { camera } = useThree()
  const selectedCuisine = useStore((s) => s.selectedCuisine)
  const globeAutoRotate = useStore((s) => s.globeAutoRotate)
  const groupRef = useRef(null)

  // Calculate 3D positions for each cuisine
  const cuisinePositions = useMemo(() => {
    return cuisineIds.reduce((acc, id) => {
      const geo = CUISINE_GEO[id]
      acc[id] = latLngToVector3(geo.lat, geo.lng, 2)
      return acc
    }, {})
  }, [])

  // Get top 15 pairs for arcs
  const topPairs = useMemo(() => {
    return sortedPairs.slice(0, 15)
  }, [])

  // Auto-rotate when not selected
  useFrame(() => {
    if (groupRef.current && globeAutoRotate) {
      groupRef.current.rotation.y += 0.0002
    }
  })

  // Camera focus on selected cuisine
  useEffect(() => {
    if (selectedCuisine && cuisinePositions[selectedCuisine]) {
      const position = cuisinePositions[selectedCuisine]
      const cameraTarget = position.clone().multiplyScalar(3)

      // Smoothly animate camera
      let progress = 0
      const startPos = camera.position.clone()
      const animateCamera = () => {
        progress += 0.02
        if (progress < 1) {
          camera.position.lerpVectors(startPos, cameraTarget, progress)
          camera.lookAt(position)
          requestAnimationFrame(animateCamera)
        }
      }
      animateCamera()
    }
  }, [selectedCuisine, camera, cuisinePositions])

  // Wireframe sphere base
  return (
    <group ref={groupRef}>
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color="#4a6fa5"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Cuisine node arcs (connect top pairs) */}
      {topPairs.map((pair, idx) => {
        const pos1 = cuisinePositions[pair.c1]
        const pos2 = cuisinePositions[pair.c2]
        if (!pos1 || !pos2) return null

        return (
          <CuisineArc
            key={idx}
            from={pos1}
            to={pos2}
            jaccard={pair.jaccard}
            color1={CUISINE_COLORS[pair.c1]}
            color2={CUISINE_COLORS[pair.c2]}
          />
        )
      })}

      {/* Cuisine nodes */}
      {cuisineIds.map((id) => {
        const position = cuisinePositions[id]
        return (
          <CuisineNode
            key={id}
            id={id}
            position={position}
            color={CUISINE_COLORS[id]}
          />
        )
      })}
    </group>
  )
}

/**
 * Side panel showing selected cuisine details
 */
function SelectedCuisinePanel() {
  const selectedCuisine = useStore((s) => s.selectedCuisine)

  if (!selectedCuisine) return null

  const summary = cuisineSummaries.find((s) => s.id === selectedCuisine)
  if (!summary) return null

  // Get top 3 most similar cuisines
  const topSimilar = sortedPairs
    .filter((p) => p.c1 === selectedCuisine || p.c2 === selectedCuisine)
    .slice(0, 3)
    .map((p) => {
      const otherId = p.c1 === selectedCuisine ? p.c2 : p.c1
      return { id: otherId, jaccard: p.jaccard }
    })

  return (
    <div className="absolute top-8 right-8 z-20 bg-slate-900/95 backdrop-blur border border-slate-700/50 rounded-lg p-6 w-80 shadow-2xl">
      <h3 className="text-xl font-bold text-[#d4a574] mb-4">{summary.name}</h3>

      <div className="space-y-3 text-slate-300 text-sm mb-6">
        <div className="flex justify-between">
          <span>Meals analyzed</span>
          <span className="text-[#d4a574] font-semibold">{summary.mealCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Unique compounds</span>
          <span className="text-[#d4a574] font-semibold">{summary.uniqueCompounds}</span>
        </div>
        <div className="flex justify-between">
          <span>Average GI</span>
          <span className="text-[#d4a574] font-semibold">{summary.avgGI}</span>
        </div>
      </div>

      <div className="border-t border-slate-700/50 pt-4">
        <p className="text-xs font-semibold text-slate-400 mb-3">Most Similar Cuisines</p>
        <div className="space-y-2">
          {topSimilar.map(({ id, jaccard }) => (
            <div key={id} className="flex items-center justify-between">
              <span className="text-sm">{CUISINE_NAMES[id]}</span>
              <div className="flex-1 mx-2 bg-slate-700/50 rounded-full h-1">
                <div
                  className="bg-[#d4a574] h-1 rounded-full"
                  style={{ width: `${jaccard * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">{(jaccard * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 2D Flat Map Fallback for mobile / no-WebGL
 * Renders cuisine nodes on a Mercator-like projection with SVG arcs.
 */
function FlatMapFallback() {
  const setSelectedCuisine = useStore((s) => s.setSelectedCuisine)
  const selectedCuisine = useStore((s) => s.selectedCuisine)

  const width = 700
  const height = 400
  const padding = 40

  // Simple Mercator projection
  function project(lat, lng) {
    const x = padding + ((lng + 180) / 360) * (width - 2 * padding)
    const y = padding + ((90 - lat) / 180) * (height - 2 * padding)
    return { x, y }
  }

  const positions = cuisineIds.reduce((acc, id) => {
    const geo = CUISINE_GEO[id]
    acc[id] = project(geo.lat, geo.lng)
    return acc
  }, {})

  const topPairs = sortedPairs.slice(0, 15)

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="2D map of cuisine connections showing flavor similarity arcs between 10 world cuisines">
        {/* Arcs */}
        {topPairs.map((pair, idx) => {
          const p1 = positions[pair.c1]
          const p2 = positions[pair.c2]
          if (!p1 || !p2) return null
          const midX = (p1.x + p2.x) / 2
          const midY = (p1.y + p2.y) / 2 - 30 * pair.jaccard
          return (
            <path
              key={idx}
              d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
              fill="none"
              stroke="#64748b"
              strokeWidth={0.5 + pair.jaccard * 2}
              opacity={0.2 + pair.jaccard * 0.4}
            />
          )
        })}

        {/* Nodes */}
        {cuisineIds.map(id => {
          const pos = positions[id]
          const isSelected = selectedCuisine === id
          return (
            <g key={id} onClick={() => setSelectedCuisine(id)} style={{ cursor: 'pointer' }}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 10 : 7}
                fill={CUISINE_COLORS[id]}
                opacity={isSelected ? 1 : 0.8}
                stroke={isSelected ? '#fff' : 'none'}
                strokeWidth={isSelected ? 2 : 0}
              />
              <text
                x={pos.x}
                y={pos.y - 12}
                textAnchor="middle"
                fill={CUISINE_COLORS[id]}
                fontSize="9"
                fontWeight="600"
              >
                {CUISINE_NAMES[id]}
              </text>
            </g>
          )
        })}
      </svg>

      <SelectedCuisinePanel />

      <div className="text-xs text-slate-500 mt-2 text-center">
        Tap a node to explore &bull; 2D view (3D globe available on desktop)
      </div>
    </div>
  )
}

/**
 * Main Globe section with 3D visualization (or 2D fallback on mobile)
 */
export const Globe = () => {
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    setUseFallback(shouldUseFallback())
    const handleResize = () => setUseFallback(shouldUseFallback())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <ScrollSection id="globe" className="w-full py-20 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[#d4a574]">
          Interactive Cuisine Topology
        </h2>

        {useFallback ? (
          <FlatMapFallback />
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50" style={{ minHeight: '600px' }}>
            <Canvas camera={{ position: [0, 0, 5.5], fov: 75 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              <pointLight position={[-10, -10, -10]} intensity={0.3} />

              <GlobeVisualization />

              <OrbitControls
                enableZoom={true}
                enablePan={true}
                autoRotate={useStore((s) => s.globeAutoRotate)}
                autoRotateSpeed={2}
              />
            </Canvas>

            <SelectedCuisinePanel />

            <div className="absolute bottom-4 left-4 text-xs text-slate-400 z-10">
              <p>Click a node to explore &bull; Drag to rotate</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-4" role="note">
            <span className="text-[#d4a574] font-semibold">Nodes:</span> 10 world cuisines at their geographic origin. Brightness indicates uniqueness of flavor profile.
          </p>
          <p className="text-slate-400 text-sm">
            <span className="text-[#d4a574] font-semibold">Arcs:</span> Top 15 pairs by flavor similarity (Jaccard coefficient). Thickness and opacity show strength of connection.
          </p>
        </div>
      </div>
    </ScrollSection>
  )
}

export default Globe
