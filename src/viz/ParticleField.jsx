import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'

const ParticleFieldScene = () => {
  const pointsRef = useRef()
  const positionsRef = useRef()
  const velocitiesRef = useRef()

  useEffect(() => {
    const particleCount = 150
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    // Initialize particles
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20
      positions[i + 1] = (Math.random() - 0.5) * 20
      positions[i + 2] = (Math.random() - 0.5) * 20

      velocities[i] = (Math.random() - 0.5) * 0.01
      velocities[i + 1] = (Math.random() - 0.5) * 0.01
      velocities[i + 2] = (Math.random() - 0.5) * 0.01
    }

    positionsRef.current = positions
    velocitiesRef.current = velocities
  }, [])

  useFrame(() => {
    if (!pointsRef.current || !positionsRef.current || !velocitiesRef.current) return

    const positions = positionsRef.current
    const velocities = velocitiesRef.current

    // Update positions
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i]
      positions[i + 1] += velocities[i + 1]
      positions[i + 2] += velocities[i + 2]

      // Wrap around bounds
      if (positions[i] > 10) positions[i] = -10
      if (positions[i] < -10) positions[i] = 10
      if (positions[i + 1] > 10) positions[i + 1] = -10
      if (positions[i + 1] < -10) positions[i + 1] = 10
      if (positions[i + 2] > 10) positions[i + 2] = -10
      if (positions[i + 2] < -10) positions[i + 2] = 10
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  const particleCount = 150
  const positions = positionsRef.current || new Float32Array(particleCount * 3)

  // Color palette: warm tones
  const colors = new Float32Array(particleCount * 3)
  const warmColors = [
    [0.83, 0.65, 0.45], // #d4a574
    [0.78, 0.58, 0.41], // #c8956a
    [0.66, 0.62, 0.58], // #a89f94
  ]

  for (let i = 0; i < particleCount; i++) {
    const color = warmColors[i % warmColors.length]
    colors[i * 3] = color[0]
    colors[i * 3 + 1] = color[1]
    colors[i * 3 + 2] = color[2]
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={particleCount} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={particleCount} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.015} vertexColors />
    </points>
  )
}

const ParticleField = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 15] }}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
        }}
        gl={{
          antialias: true,
          alpha: true,
          transparent: true,
        }}
      >
        <ParticleFieldScene />
      </Canvas>
    </div>
  )
}

export default ParticleField
