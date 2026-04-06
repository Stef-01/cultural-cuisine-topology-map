import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { computeTraditionalVsModern } from '../data/computed'
import { CUISINE_COLORS, CUISINE_NAMES, GI_ZONES } from '../data/constants'

const DumbbellChart = () => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 })
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 400,
        })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!svgRef.current || !dimensions.width) return

    const data = computeTraditionalVsModern()
    const width = dimensions.width
    const height = dimensions.height
    const margin = { top: 20, right: 40, bottom: 50, left: 140 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.append('title').text('Traditional vs Modern glycemic index comparison across 10 world cuisines')

    const yScale = d3
      .scaleBand()
      .domain(data.map(d => d.cuisine))
      .range([0, innerHeight])
      .padding(0.4)

    const xScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth])

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // GI zone background bands
    GI_ZONES.forEach(zone => {
      g.append('rect')
        .attr('y', 0)
        .attr('x', xScale(zone.min))
        .attr('width', xScale(zone.max) - xScale(zone.min))
        .attr('height', innerHeight)
        .attr('fill', zone.color)
        .attr('opacity', 0.08)
    })

    // Dashed connecting lines
    g.selectAll('line.connector')
      .data(data)
      .join('line')
      .attr('class', 'connector')
      .attr('x1', d => xScale(d.traditional.avgGI))
      .attr('x2', d => xScale(d.modern.avgGI))
      .attr('y1', d => yScale(d.cuisine) + yScale.bandwidth() / 2)
      .attr('y2', d => yScale(d.cuisine) + yScale.bandwidth() / 2)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4')
      .attr('opacity', 0.5)

    // Traditional GI dots (green)
    g.selectAll('circle.traditional')
      .data(data)
      .join('circle')
      .attr('class', 'traditional')
      .attr('cx', d => xScale(d.traditional.avgGI))
      .attr('cy', d => yScale(d.cuisine) + yScale.bandwidth() / 2)
      .attr('r', 5)
      .attr('fill', '#6a9968')
      .attr('opacity', 0.8)
      .on('mouseenter', (event, d) => {
        const stats = d.statistics || {}
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          cuisine: CUISINE_NAMES[d.cuisine],
          type: 'Traditional',
          gi: d.traditional.avgGI.toFixed(1),
          sd: (d.traditional.sdGI || 0).toFixed(1),
          count: d.traditional.count,
          pValue: stats.tTest ? stats.tTest.p.toFixed(4) : null,
          stars: stats.stars || '',
          effectSize: stats.cohensD != null ? stats.cohensD.toFixed(2) : null,
          effectLabel: stats.effectLabel || '',
          ciLow: stats.bootstrapCI ? stats.bootstrapCI.lower.toFixed(1) : null,
          ciHigh: stats.bootstrapCI ? stats.bootstrapCI.upper.toFixed(1) : null,
        })
      })
      .on('mouseleave', () => setTooltip(null))

    // Modern GI dots (orange/red)
    g.selectAll('circle.modern')
      .data(data)
      .join('circle')
      .attr('class', 'modern')
      .attr('cx', d => xScale(d.modern.avgGI))
      .attr('cy', d => yScale(d.cuisine) + yScale.bandwidth() / 2)
      .attr('r', 5)
      .attr('fill', '#c17d5d')
      .attr('opacity', 0.8)
      .on('mouseenter', (event, d) => {
        const stats = d.statistics || {}
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          cuisine: CUISINE_NAMES[d.cuisine],
          type: 'Modern',
          gi: d.modern.avgGI.toFixed(1),
          sd: (d.modern.sdGI || 0).toFixed(1),
          count: d.modern.count,
          pValue: stats.tTest ? stats.tTest.p.toFixed(4) : null,
          stars: stats.stars || '',
          effectSize: stats.cohensD != null ? stats.cohensD.toFixed(2) : null,
          effectLabel: stats.effectLabel || '',
          ciLow: stats.bootstrapCI ? stats.bootstrapCI.lower.toFixed(1) : null,
          ciHigh: stats.bootstrapCI ? stats.bootstrapCI.upper.toFixed(1) : null,
        })
      })
      .on('mouseleave', () => setTooltip(null))

    // Gap labels with significance stars
    g.selectAll('text.gap')
      .data(data.filter(d => d.gap > 0))
      .join('text')
      .attr('class', 'gap')
      .attr('x', d => (xScale(d.traditional.avgGI) + xScale(d.modern.avgGI)) / 2)
      .attr('y', d => yScale(d.cuisine) + yScale.bandwidth() / 2 - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('fill', d => d.statistics?.tTest?.significant ? '#fbbf24' : '#cbd5e1')
      .text(d => {
        const stars = d.statistics?.stars || ''
        return `+${d.gap.toFixed(1)} ${stars}`
      })

    // Y axis labels (cuisine names)
    g.selectAll('text.label-cuisine')
      .data(data)
      .join('text')
      .attr('class', 'label-cuisine')
      .attr('x', -10)
      .attr('y', d => yScale(d.cuisine) + yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-size', 11)
      .attr('fill', d => CUISINE_COLORS[d.cuisine])
      .attr('font-weight', 600)
      .text(d => CUISINE_NAMES[d.cuisine])

    // X axis
    const xAxis = d3.axisBottom(xScale).ticks(10)
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .style('color', '#64748b')

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1')
      .attr('font-size', 11)
      .text('Glycemic Index')

    // Legend
    const legendY = 10
    const legendX = innerWidth - 120

    svg
      .append('circle')
      .attr('cx', margin.left + legendX)
      .attr('cy', margin.top + legendY)
      .attr('r', 4)
      .attr('fill', '#6a9968')

    svg
      .append('text')
      .attr('x', margin.left + legendX + 12)
      .attr('y', margin.top + legendY + 3)
      .attr('font-size', 10)
      .attr('fill', '#cbd5e1')
      .text('Traditional')

    svg
      .append('circle')
      .attr('cx', margin.left + legendX)
      .attr('cy', margin.top + legendY + 18)
      .attr('r', 4)
      .attr('fill', '#c17d5d')

    svg
      .append('text')
      .attr('x', margin.left + legendX + 12)
      .attr('y', margin.top + legendY + 18 + 3)
      .attr('font-size', 10)
      .attr('fill', '#cbd5e1')
      .text('Modern')

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text('Traditional vs Modern GI Gap (Welch\'s t-test, Bonferroni-corrected)')

    // Significance legend at bottom
    svg
      .append('text')
      .attr('x', margin.left)
      .attr('y', height - 5)
      .attr('fill', '#64748b')
      .attr('font-size', 8)
      .text('* p<0.05  ** p<0.01  *** p<0.001 (Bonferroni α=0.005, highlighted = significant)')
  }, [dimensions])

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        className="w-full border border-slate-700/50 rounded"
        style={{ height: '400px', backgroundColor: '#0a0a0f' }}
        role="img"
        aria-label="Traditional vs Modern glycemic index comparison across 10 world cuisines"
      />

      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 pointer-events-none z-50"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-semibold">{tooltip.cuisine}</div>
          <div>{tooltip.type} Avg GI: {tooltip.gi} (SD: {tooltip.sd})</div>
          <div className="text-slate-400">{tooltip.count} meals</div>
          {tooltip.pValue && (
            <div className="text-slate-400 mt-1 border-t border-slate-700 pt-1">
              <div>p = {tooltip.pValue} {tooltip.stars}</div>
              <div>Cohen&apos;s d = {tooltip.effectSize} ({tooltip.effectLabel})</div>
              <div>95% CI: [{tooltip.ciLow}, {tooltip.ciHigh}]</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DumbbellChart
