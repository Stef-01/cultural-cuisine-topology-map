import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { computeFlavorFingerprints } from '../data/computed'
import { CUISINE_COLORS, CUISINE_NAMES, COMPOUND_FAMILIES } from '../data/constants'

const RadarChart = ({ cuisineId = null, compareIds = null }) => {
  const svgRef = useRef()
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!svgRef.current) return

    const fingerprints = computeFlavorFingerprints()
    const axes = Object.keys(COMPOUND_FAMILIES).concat(['other'])

    // Select primary and comparison cuisines
    let selectedFingerprints = []
    if (cuisineId) {
      const fp = fingerprints.find(f => f.cuisine === cuisineId)
      if (fp) selectedFingerprints.push({ ...fp, isCurrent: true })

      if (compareIds && Array.isArray(compareIds)) {
        compareIds.forEach(cid => {
          const cfp = fingerprints.find(f => f.cuisine === cid)
          if (cfp) selectedFingerprints.push({ ...cfp, isCurrent: false })
        })
      }
    } else {
      // Show first cuisine if none specified
      selectedFingerprints = [fingerprints[0]]
    }

    const width = 350
    const height = 350
    const radius = Math.min(width, height) / 2 - 40
    const centerX = width / 2
    const centerY = height / 2

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const angleSlice = (Math.PI * 2) / axes.length

    // Radial scale
    const rScale = d3.scaleLinear().domain([0, 1]).range([0, radius])

    // Draw grid circles
    const levels = 5
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level

      svg
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', levelRadius)
        .attr('fill', 'none')
        .attr('stroke', '#64748b')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.4)

      // Level labels
      svg
        .append('text')
        .attr('x', centerX + 5)
        .attr('y', centerY - levelRadius + 5)
        .attr('font-size', 9)
        .attr('fill', '#64748b')
        .attr('opacity', 0.6)
        .text((level / levels).toFixed(1))
    }

    // Draw axes
    axes.forEach((axis, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const x1 = centerX + radius * Math.cos(angle)
      const y1 = centerY + radius * Math.sin(angle)

      svg
        .append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', x1)
        .attr('y2', y1)
        .attr('stroke', '#64748b')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.3)

      const labelRadius = radius + 25
      const labelX = centerX + labelRadius * Math.cos(angle)
      const labelY = centerY + labelRadius * Math.sin(angle)

      svg
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dy', 4)
        .attr('font-size', 10)
        .attr('fill', '#cbd5e1')
        .text(axis === 'other' ? 'Other' : axis.charAt(0).toUpperCase() + axis.slice(1))
    })

    // Draw polygons for each selected cuisine
    selectedFingerprints.forEach((fp, idx) => {
      const dataPoints = axes.map(axis => ({
        axis,
        value: fp.normalized[axis] || 0,
      }))

      const points = dataPoints
        .map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2
          const x = centerX + rScale(d.value) * Math.cos(angle)
          const y = centerY + rScale(d.value) * Math.sin(angle)
          return [x, y]
        })
        .join(' ')

      const color = CUISINE_COLORS[fp.cuisine]

      // Filled polygon
      svg
        .append('polygon')
        .attr('points', points)
        .attr('fill', color)
        .attr('opacity', selectedFingerprints.length > 1 && !fp.isCurrent ? 0.15 : 0.2)
        .attr('stroke', color)
        .attr('stroke-width', fp.isCurrent ? 2 : 1)
        .attr('stroke-opacity', 0.8)

      // Data points
      svg
        .selectAll(`circle.cuisine-${fp.cuisine}`)
        .data(dataPoints)
        .join('circle')
        .attr('class', `cuisine-${fp.cuisine}`)
        .attr('cx', (d, i) => {
          const angle = angleSlice * i - Math.PI / 2
          return centerX + rScale(d.value) * Math.cos(angle)
        })
        .attr('cy', (d, i) => {
          const angle = angleSlice * i - Math.PI / 2
          return centerY + rScale(d.value) * Math.sin(angle)
        })
        .attr('r', 3)
        .attr('fill', color)
        .attr('opacity', 0.7)
        .on('mouseenter', (event, d) => {
          setTooltip({
            x: event.pageX,
            y: event.pageY,
            cuisine: CUISINE_NAMES[fp.cuisine],
            family: d.axis,
            percentage: (d.value * 100).toFixed(1),
          })
        })
        .on('mouseleave', () => setTooltip(null))
    })

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text(
        `Flavor Fingerprint${selectedFingerprints.length > 1 ? 's' : ''}: ${selectedFingerprints
          .map(f => CUISINE_NAMES[f.cuisine])
          .join(' vs ')}`
      )
  }, [cuisineId, compareIds])

  return (
    <div className="w-full flex justify-center">
      <svg
        ref={svgRef}
        width="350"
        height="350"
        className="border border-slate-700/50 rounded"
        style={{ backgroundColor: '#0a0a0f' }}
      />

      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 pointer-events-none z-50"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-semibold">{tooltip.cuisine}</div>
          <div className="capitalize">{tooltip.family}</div>
          <div>{tooltip.percentage}%</div>
        </div>
      )}
    </div>
  )
}

export default RadarChart
