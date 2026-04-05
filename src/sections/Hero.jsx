import { Canvas } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import ScrollSection from '../components/ScrollSection'
import AnimatedCounter from '../components/AnimatedCounter'
import { totalMeals } from '../data/computed'

/**
 * Floating particle background component for Hero section
 */
function ParticleBackground() {
  const particlesRef = useRef(null)

  useEffect(() => {
    if (!particlesRef.current) return

    const geometry = new THREE.BufferGeometry()
    const count = 200

    // Generate random positions in 3D space
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20

      velocities[i * 3] = (Math.random() - 0.5) * 0.002
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.userData.velocities = velocities

    const colors = new Float32Array(count * 3)
    const colorAccent = new THREE.Color('#d4a574')
    const colorMuted = new THREE.Color('#8b7566')

    for (let i = 0; i < count; i++) {
      const blend = Math.random()
      const color = colorAccent.clone().lerp(colorMuted, blend)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geometry, material)
    particlesRef.current.add(points)

    // Animation loop
    let animationId
    const animate = () => {
      const positions = geometry.attributes.position.array
      const velocities = geometry.userData.velocities

      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3]
        positions[i * 3 + 1] += velocities[i * 3 + 1]
        positions[i * 3 + 2] += velocities[i * 3 + 2]

        // Wrap around boundaries
        if (Math.abs(positions[i * 3]) > 10) velocities[i * 3] *= -1
        if (Math.abs(positions[i * 3 + 1]) > 10) velocities[i * 3 + 1] *= -1
        if (Math.abs(positions[i * 3 + 2]) > 10) velocities[i * 3 + 2] *= -1
      }

      geometry.attributes.position.needsUpdate = true
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      geometry.dispose()
      material.dispose()
    }
  }, [])

  return <group ref={particlesRef} />
}

/**
 * Hero section with animated particle background and statistics
 */
export const Hero = () => {
  return (
    <ScrollSection id="hero" className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ParticleBackground />
        </Canvas>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Title */}
        <h1 className="font-georgia text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#d4a574] to-[#c8956a] bg-clip-text text-transparent">
          The Cultural Cuisine Topology Map
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-400 mb-16 max-w-2xl leading-relaxed">
          Flavor Molecule Diversity × Glycemic Impact Across World Cuisines
        </p>

        {/* Stat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-2xl w-full">
          <div className="bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-6">
            <div className="text-3xl font-bold text-[#d4a574] mb-2">
              <AnimatedCounter target={1932} duration={2500} suffix=" " />
            </div>
            <p className="text-slate-300">Meals Analyzed</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-6">
            <div className="text-3xl font-bold text-[#d4a574] mb-2">
              <AnimatedCounter target={333} duration={2500} suffix=" " />
            </div>
            <p className="text-slate-300">Flavor Compounds</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-6">
            <div className="text-3xl font-bold text-[#d4a574] mb-2">
              <AnimatedCounter target={10} duration={2500} suffix=" " />
            </div>
            <p className="text-slate-300">World Cuisines</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-6">
            <div className="text-3xl font-bold text-[#d4a574] mb-2">
              <AnimatedCounter target={45} duration={2500} suffix=" " />
            </div>
            <p className="text-slate-300">Pairwise Similarities</p>
          </div>
        </div>

        {/* Quote Block */}
        <blockquote className="max-w-2xl text-lg text-slate-300 italic border-l-4 border-[#d4a574] pl-6 mb-16">
          "Every mainstream diabetes guide recommends the Mediterranean diet. But 85% of the world doesn't eat Mediterranean food. What if your grandmother's cuisine already had the answers?"
        </blockquote>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 flex flex-col items-center animate-bounce">
          <svg className="w-6 h-6 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </ScrollSection>
  )
}

export default Hero
