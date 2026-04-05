import { Canvas } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import ScrollSection from '../components/ScrollSection'
import AnimatedCounter from '../components/AnimatedCounter'
import { totalMeals, cuisineIds } from '../data/computed'
import { CUISINE_NAMES, CUISINE_COLORS } from '../data/constants'

/**
 * Floating particle background component for Hero section
 */
function ParticleBackground() {
  const particlesRef = useRef(null)

  useEffect(() => {
    if (!particlesRef.current) return

    const geometry = new THREE.BufferGeometry()
    const count = 200

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

    let animationId
    const animate = () => {
      const pos = geometry.attributes.position.array
      const vel = geometry.userData.velocities

      for (let i = 0; i < count; i++) {
        pos[i * 3] += vel[i * 3]
        pos[i * 3 + 1] += vel[i * 3 + 1]
        pos[i * 3 + 2] += vel[i * 3 + 2]
        if (Math.abs(pos[i * 3]) > 10) vel[i * 3] *= -1
        if (Math.abs(pos[i * 3 + 1]) > 10) vel[i * 3 + 1] *= -1
        if (Math.abs(pos[i * 3 + 2]) > 10) vel[i * 3 + 2] *= -1
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
 * "Find Your Cuisine" quick-start selector
 */
function CuisineQuickSelect() {
  const handleClick = (id) => {
    const el = document.getElementById('clinical')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <p className="text-sm text-slate-400 text-center mb-4">Find your cuisine &darr;</p>
      <div className="flex flex-wrap justify-center gap-2">
        {cuisineIds.map(id => (
          <button
            key={id}
            onClick={() => handleClick(id)}
            className="group px-4 py-2 rounded-full border border-slate-700/50 bg-slate-900/40 backdrop-blur
                       hover:border-[#d4a574]/50 hover:bg-[#d4a574]/10 transition-all duration-300"
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: CUISINE_COLORS[id] }}
            />
            <span className="text-sm text-slate-300 group-hover:text-[#d4a574] transition-colors">
              {CUISINE_NAMES[id]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Hero section with animated particle background and statistics
 */
export const Hero = () => {
  return (
    <ScrollSection id="hero" className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ParticleBackground />
        </Canvas>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#d4a574] to-[#c8956a] bg-clip-text text-transparent leading-tight">
          The Cultural Cuisine<br className="hidden sm:block" /> Topology Map
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
          Flavor Molecule Diversity &times; Glycemic Impact Across World Cuisines
        </p>

        {/* Stat Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 max-w-3xl w-full">
          <div className="bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-[#d4a574] mb-1">
              <AnimatedCounter target={totalMeals} duration={2500} />
            </div>
            <p className="text-xs md:text-sm text-slate-400">Meals Analyzed</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-[#d4a574] mb-1">
              <AnimatedCounter target={333} duration={2500} />
            </div>
            <p className="text-xs md:text-sm text-slate-400">Flavor Compounds</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-[#d4a574] mb-1">
              <AnimatedCounter target={10} duration={2500} />
            </div>
            <p className="text-xs md:text-sm text-slate-400">World Cuisines</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-[#d4a574] mb-1">
              <AnimatedCounter target={45} duration={2500} />
            </div>
            <p className="text-xs md:text-sm text-slate-400">Pairwise Similarities</p>
          </div>
        </div>

        {/* Find Your Cuisine */}
        <CuisineQuickSelect />

        {/* Quote Block */}
        <blockquote className="max-w-2xl text-base md:text-lg text-slate-300 italic border-l-4 border-[#d4a574] pl-6 mb-16">
          &ldquo;Every mainstream diabetes guide recommends the Mediterranean diet. But 85% of the world
          doesn&rsquo;t eat Mediterranean food. What if your grandmother&rsquo;s cuisine already had the answers?&rdquo;
        </blockquote>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 flex flex-col items-center animate-bounce" aria-hidden="true">
          <span className="text-xs text-slate-500 mb-2">Scroll to explore</span>
          <svg className="w-6 h-6 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </ScrollSection>
  )
}

export default Hero
