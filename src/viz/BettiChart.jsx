import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { computeBettiNumbers } from '../data/computed'

const BettiChart = () => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 })
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 300,
        })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!svgRef.current || !dimensions.width) return

    const data = computeBettiNumbers()
    const width = dimensions.width
    const height = dimensions.height
    const margin = { top: 20, right: 20, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.append('title').text('Betti numbers by filtration threshold for cuisine compound similarity')

    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.threshold.toFixed(2)))
      .range([0, innerWidth])
      .padding(0.2)

    const yScale = d3
      .scaleLinear()
      .domain([0, 10])
      .range([innerHeight, 0])

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Group data for grouped bar chart
    const grouped = data.map(d => ({
      threshold: d.threshold.toFixed(2),
      beta0: d.beta0,
      beta1: d.beta1,
    }))

    const subgroups = ['beta0', 'beta1']
    const xSubScale = d3
      .scaleBand()
      .domain(subgroups)
      .range([0, xScale.bandwidth()])

    // Draw bars
    g.selectAll('g.threshold')
      .data(grouped)
      .join('g')
      .attr('class', 'threshold')
      .attr('transform', d => `translate(${xScale(d.threshold)},0)`)
      .selectAll('rect')
      .data(d => [
        { threshold: d.threshold, value: d.beta0, type: 'beta0' },
        { threshold: d.threshold, value: d.beta1, type: 'beta1' },
      ])
      .join('rect')
      .attr('x', d => xSubScale(d.type))
      .attr('y', d => yScale(d.value))
      .attr('width', xSubScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.value))
      .attr('fill', d => (d.type === 'beta0' ? '#3b82f6' : '#f97316'))
      .attr('opacity', 0.8)
      .on('mouseenter', (event, d) => {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          threshold: d.threshold,
          type: d.type === 'beta0' ? 'β₀ (Components)' : 'β₁ (Loops)',
          value: d.value,
        })
      })
      .on('mouseleave', () => setTooltip(null))

    // X axis
    const xAxis = d3.axisBottom(xScale)
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
      .text('Filtration Threshold')

    // Y axis
    const yAxis = d3.axisLeft(yScale).ticks(5)
    g.append('g').call(yAxis).style('color', '#a89f94')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e4dd')
      .attr('font-size', 11)
      .text('Count')

    // Legend
    svg
      .append('g')
      .attr('transform', `translate(${width - 120}, 20)`)
      .selectAll('g')
      .data(subgroups)
      .join('g')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`)
      .call(g => {
        g.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', d => (d === 'beta0' ? '#3b82f6' : '#f97316'))
          .attr('opacity', 0.8)

        g.append('text')
          .attr('x', 18)
          .attr('y', 9)
          .attr('font-size', 10)
          .attr('fill', '#e8e4dd')
          .text(d => (d === 'beta0' ? 'β₀' : 'β₁'))
      })
  }, [dimensions])

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        className="w-full border border-gray-800 rounded"
        style={{ height: '300px', backgroundColor: '#0a0a0f' }}
        role="img"
        aria-label="Betti numbers by filtration threshold for cuisine compound similarity"
      />

      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 pointer-events-none z-50"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-semibold text-[#d4a574]">{tooltip.type}</div>
          <div>Threshold: {tooltip.threshold}</div>
          <div>Count: {tooltip.value}</div>
        </div>
      )}
    </div>
  )
}

export default BettiChart
