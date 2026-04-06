import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { computeEntropyPerCuisine } from '../data/computed'
import { CUISINE_COLORS, CUISINE_NAMES } from '../data/constants'

const EntropyChart = () => {
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

    const data = computeEntropyPerCuisine()
    const width = dimensions.width
    const height = dimensions.height
    const margin = { top: 20, right: 120, bottom: 40, left: 140 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.append('title').text('Shannon entropy of compound sharing diversity per cuisine')

    const maxEntropy = Math.max(...data.map(d => d.entropy))

    const yScale = d3
      .scaleBand()
      .domain(data.map(d => d.cuisine))
      .range([0, innerHeight])
      .padding(0.3)

    const xScale = d3
      .scaleLinear()
      .domain([0, maxEntropy * 1.1])
      .range([0, innerWidth])

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

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

    // Bars
    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('y', d => yScale(d.cuisine))
      .attr('x', 0)
      .attr('width', d => xScale(d.entropy))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => CUISINE_COLORS[d.cuisine])
      .attr('opacity', 0.7)
      .on('mouseenter', (event, d) => {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          cuisine: CUISINE_NAMES[d.cuisine],
          entropy: d.entropy.toFixed(2),
          compounds: d.compoundCount,
        })
      })
      .on('mouseleave', () => setTooltip(null))

    // Entropy values on the right
    g.selectAll('text.label-entropy')
      .data(data)
      .join('text')
      .attr('class', 'label-entropy')
      .attr('x', d => xScale(d.entropy) + 5)
      .attr('y', d => yScale(d.cuisine) + yScale.bandwidth() / 2 + 4)
      .attr('font-size', 10)
      .attr('fill', '#e8e4dd')
      .text(d => d.entropy.toFixed(2))

    // X axis
    const xAxis = d3.axisBottom(xScale).ticks(6)
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .style('color', '#a89f94')

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e4dd')
      .attr('font-size', 11)
      .text('Shannon Entropy (bits)')

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e4dd')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text('Compound-Sharing Entropy by Cuisine')
  }, [dimensions])

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        className="w-full border border-gray-800 rounded"
        style={{ height: '400px', backgroundColor: '#0a0a0f' }}
        role="img"
        aria-label="Shannon entropy of compound sharing diversity per cuisine"
      />

      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 pointer-events-none z-50"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-semibold text-[#d4a574]">{tooltip.cuisine}</div>
          <div>Entropy: {tooltip.entropy} bits</div>
          <div className="text-slate-400">{tooltip.compounds} compounds</div>
        </div>
      )}
    </div>
  )
}

export default EntropyChart
