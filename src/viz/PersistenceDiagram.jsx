import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { computePersistenceDiagram } from '../data/computed'

const PersistenceDiagram = () => {
  const svgRef = useRef()
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!svgRef.current) return

    const { beta0Features, beta1Features, metadata } = computePersistenceDiagram()

    const width = 400
    const height = 400
    const margin = { top: 20, right: 20, bottom: 50, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Find max birth/death for domain
    const allFeatures = [...beta0Features, ...beta1Features]
    const maxVal = Math.max(
      ...allFeatures
        .filter(f => f.death !== Infinity)
        .map(f => Math.max(f.birth, f.death)),
      0.5
    )

    const xScale = d3.scaleLinear().domain([0, maxVal * 1.1]).range([0, innerWidth])
    const yScale = d3.scaleLinear().domain([0, maxVal * 1.1]).range([innerHeight, 0])

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Diagonal reference line (birth = death)
    g.append('line')
      .attr('x1', xScale(0))
      .attr('y1', yScale(0))
      .attr('x2', xScale(maxVal * 1.1))
      .attr('y2', yScale(maxVal * 1.1))
      .attr('stroke', '#a89f94')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4')
      .attr('opacity', 0.5)

    // Filter features for visualization
    const finiteBeta0 = beta0Features.filter(f => f.death !== Infinity)
    const infinityBeta0 = beta0Features.filter(f => f.death === Infinity)

    // Render β₀ circles (finite)
    g.selectAll('circle.beta0-finite')
      .data(finiteBeta0)
      .join('circle')
      .attr('class', 'beta0-finite')
      .attr('cx', d => xScale(d.birth))
      .attr('cy', d => yScale(d.death))
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.7)
      .on('mouseenter', (event, d) => {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          type: 'β₀ (Connected Component)',
          birth: d.birth.toFixed(3),
          death: d.death.toFixed(3),
          persistence: (d.death - d.birth).toFixed(3),
        })
      })
      .on('mouseleave', () => setTooltip(null))

    // Render β₀ infinity marker (star)
    g.selectAll('g.beta0-infinity')
      .data(infinityBeta0)
      .join('g')
      .attr('class', 'beta0-infinity')
      .attr('transform', d => `translate(${xScale(d.birth)}, ${yScale(maxVal * 0.95)})`)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-size', 12)
      .attr('fill', '#3b82f6')
      .text('★')
      .on('mouseenter', function (event, d) {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          type: 'β₀ (Connected Component)',
          birth: d.birth.toFixed(3),
          death: '∞',
          persistence: '∞',
        })
      })
      .on('mouseleave', () => setTooltip(null))

    // Render β₁ triangles
    const triangleSize = 4
    g.selectAll('polygon.beta1')
      .data(beta1Features)
      .join('polygon')
      .attr('class', 'beta1')
      .attr('points', d => {
        const cx = xScale(d.birth)
        const cy = yScale(d.death)
        return [
          [cx, cy - triangleSize],
          [cx + triangleSize, cy + triangleSize],
          [cx - triangleSize, cy + triangleSize],
        ]
          .map(p => p.join(','))
          .join(' ')
      })
      .attr('fill', '#f97316')
      .attr('opacity', 0.7)
      .on('mouseenter', (event, d) => {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          type: 'β₁ (Loop)',
          birth: d.birth.toFixed(3),
          death: d.death.toFixed(3),
          persistence: (d.death - d.birth).toFixed(3),
        })
      })
      .on('mouseleave', () => setTooltip(null))

    // X axis
    const xAxis = d3.axisBottom(xScale).ticks(5)
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .style('color', '#a89f94')

    // X label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e4dd')
      .attr('font-size', 11)
      .text('Birth (Jaccard distance)')

    // Y axis
    const yAxis = d3.axisLeft(yScale).ticks(5)
    g.append('g').call(yAxis).style('color', '#a89f94')

    // Y label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e4dd')
      .attr('font-size', 11)
      .text('Death (Jaccard distance)')

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e4dd')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text('Persistence Diagram — Vietoris-Rips on Flavor Compound Jaccard Distances')

    // Footer with methodology note
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a89f94')
      .attr('font-size', 8)
      .text(`β₀: Union-Find (exact) | β₁: Boundary reduction (exact) | n=${metadata.n_points} cuisines, ${metadata.n_edges} edges`)

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f59e0b')
      .attr('font-size', 7)
      .text('Note: n=10 is illustrative; interpret as hierarchical similarity summary, not deep topological structure')

    // Legend
    const legendX = margin.left + 10
    const legendY = margin.top + 10

    svg
      .append('circle')
      .attr('cx', legendX)
      .attr('cy', legendY)
      .attr('r', 3)
      .attr('fill', '#3b82f6')

    svg
      .append('text')
      .attr('x', legendX + 12)
      .attr('y', legendY + 3)
      .attr('font-size', 10)
      .attr('fill', '#e8e4dd')
      .text('β₀')

    svg
      .append('polygon')
      .attr('points', `${legendX},${legendY + 20} ${legendX + 4},${legendY + 26} ${legendX - 4},${legendY + 26}`)
      .attr('fill', '#f97316')

    svg
      .append('text')
      .attr('x', legendX + 12)
      .attr('y', legendY + 23)
      .attr('font-size', 10)
      .attr('fill', '#e8e4dd')
      .text('β₁')
  }, [])

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        width="400"
        height="400"
        className="border border-gray-800 rounded mx-auto"
        style={{ backgroundColor: '#0a0a0f' }}
      />

      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 pointer-events-none z-50"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-semibold text-[#d4a574]">{tooltip.type}</div>
          <div>Birth: {tooltip.birth}</div>
          <div>Death: {tooltip.death}</div>
          <div className="text-slate-400">Persistence: {tooltip.persistence}</div>
        </div>
      )}
    </div>
  )
}

export default PersistenceDiagram
