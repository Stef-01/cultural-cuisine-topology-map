import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { computeCompoundPersistence } from '../data/computed'

/**
 * Compound-level persistence diagram (n=333).
 * Shows β₀ features from Vietoris-Rips on Hamming distance.
 * This is the academically meaningful TDA — unlike n=10 cuisine-level.
 */
const CompoundPersistence = () => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 })
  const [tooltip, setTooltip] = useState(null)

  const persistence = useMemo(() => computeCompoundPersistence(), [])

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: 400 })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!svgRef.current || !dimensions.width || !persistence) return

    const width = dimensions.width
    const height = dimensions.height
    const margin = { top: 30, right: 30, bottom: 50, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.append('title').text('Compound-level persistence diagram (n=' + persistence.n_compounds + ', Hamming distance)')

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const finiteFeatures = persistence.beta0Features.filter(f => f.death !== Infinity)
    const maxDeath = Math.max(...finiteFeatures.map(f => f.death), 0.5)

    const xScale = d3.scaleLinear().domain([0, maxDeath * 1.1]).range([0, innerWidth])
    const yScale = d3.scaleLinear().domain([0, maxDeath * 1.1]).range([innerHeight, 0])

    // Diagonal line (birth = death)
    g.append('line')
      .attr('x1', xScale(0)).attr('y1', yScale(0))
      .attr('x2', xScale(maxDeath * 1.1)).attr('y2', yScale(maxDeath * 1.1))
      .attr('stroke', '#334155').attr('stroke-dasharray', '4').attr('opacity', 0.5)

    // Plot β₀ features
    g.selectAll('circle.beta0')
      .data(finiteFeatures)
      .join('circle')
      .attr('class', 'beta0')
      .attr('cx', d => xScale(d.birth))
      .attr('cy', d => yScale(d.death))
      .attr('r', 2)
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.5)
      .on('mouseenter', (event, d) => {
        setTooltip({
          x: event.pageX, y: event.pageY,
          type: 'Component merge',
          birth: d.birth.toFixed(3),
          death: d.death.toFixed(3),
          persistence: (d.death - d.birth).toFixed(3),
          compounds: d.pair ? d.pair.join(' + ') : '',
        })
      })
      .on('mouseleave', () => setTooltip(null))

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .style('color', '#64748b')

    g.append('text')
      .attr('x', innerWidth / 2).attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', 10)
      .text('Birth (Hamming distance)')

    g.append('g').call(d3.axisLeft(yScale).ticks(6)).style('color', '#64748b')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40).attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', 10)
      .text('Death (Hamming distance)')

    // Title
    svg.append('text')
      .attr('x', width / 2).attr('y', 18)
      .attr('text-anchor', 'middle').attr('fill', '#e2e8f0').attr('font-size', 12).attr('font-weight', 600)
      .text(`Compound-Level Persistence (n=${persistence.n_compounds})`)

    // Stats annotation
    svg.append('text')
      .attr('x', width / 2).attr('y', height - 5)
      .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', 8)
      .text(`${persistence.statistics.finiteFeatures} features | avg persistence: ${persistence.statistics.avgPersistence.toFixed(3)} | max: ${persistence.statistics.maxPersistence.toFixed(3)}`)

  }, [dimensions, persistence])

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        className="w-full border border-slate-700/50 rounded"
        style={{ height: '400px', backgroundColor: '#0a0a0f' }}
        role="img"
        aria-label="Compound-level persistence diagram showing topological features of flavor compound networks"
      />

      {/* Cluster count chart */}
      <div className="mt-3 grid grid-cols-4 sm:grid-cols-8 gap-2">
        {persistence.clusterCounts.map(c => (
          <div key={c.threshold} className="bg-slate-800/50 rounded p-2 text-center">
            <div className="text-xs text-slate-500">d={c.threshold}</div>
            <div className="text-sm font-bold text-blue-400">{c.clusters}</div>
            <div className="text-xs text-slate-600">clusters</div>
          </div>
        ))}
      </div>

      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 pointer-events-none z-50"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-semibold text-blue-400">{tooltip.type}</div>
          <div>Birth: {tooltip.birth} | Death: {tooltip.death}</div>
          <div className="text-slate-400">Persistence: {tooltip.persistence}</div>
          {tooltip.compounds && <div className="text-slate-500 truncate max-w-[200px]">{tooltip.compounds}</div>}
        </div>
      )}

      <p className="mt-2 text-xs text-slate-600 text-center">
        {persistence.n_compounds} compounds in {persistence.metadata.dimensions.split(' in ')[1]}.
        Each point = a component merge event. Points far from the diagonal = long-lived topological features.
        Cluster counts show how many distinct groups exist at each Hamming distance threshold.
      </p>
    </div>
  )
}

export default CompoundPersistence
