import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { getGIDistribution, cuisineIds } from '../data/computed'
import { CUISINE_NAMES, CUISINE_COLORS, GI_ZONES, CATEGORY_LABELS } from '../data/constants'

const BeeswarmChart = ({ cuisineId = null }) => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 800, height: 300 })
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

    const width = dimensions.width
    const height = dimensions.height
    const margin = { top: 20, right: 20, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Gather data
    let meals = []
    if (cuisineId && cuisineId !== 'all') {
      meals = getGIDistribution(cuisineId)
    } else {
      // Show all cuisines
      cuisineIds.forEach(id => {
        getGIDistribution(id).forEach(meal => {
          meals.push({ ...meal, cuisineId: id })
        })
      })
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.append('title').text('Glycemic index distribution beeswarm plot')

    // Scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth])
    const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0])

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // GI zone backgrounds
    GI_ZONES.forEach(zone => {
      g.append('rect')
        .attr('x', xScale(zone.min))
        .attr('width', xScale(zone.max) - xScale(zone.min))
        .attr('height', innerHeight)
        .attr('fill', zone.color)
        .attr('opacity', 0.1)
    })

    // Force simulation for jitter/collision
    const simulation = d3
      .forceSimulation(meals)
      .force('x', d3.forceX(d => xScale(d.gi)).strength(0.5))
      .force('y', d3.forceY(innerHeight / 2).strength(0.1))
      .force('collide', d3.forceCollide(cuisineId ? 4 : 3))
      .stop()

    // Run simulation
    for (let i = 0; i < 100; i++) simulation.tick()

    // Draw circles
    const circles = g
      .selectAll('circle')
      .data(meals)
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', cuisineId ? 4 : 3)
      .attr('fill', d => {
        const zone = GI_ZONES.find(z => d.gi >= z.min && d.gi < z.max)
        return zone?.color || '#999'
      })
      .attr('opacity', 0.7)
      .on('mouseenter', (event, d) => {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          name: d.name,
          gi: d.gi.toFixed(1),
          category: CATEGORY_LABELS[d.category] || d.category,
          ref: d.ref || 'unknown',
        })
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', cuisineId ? 6 : 5)
          .attr('opacity', 1)
      })
      .on('mouseleave', (event) => {
        setTooltip(null)
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', cuisineId ? 4 : 3)
          .attr('opacity', 0.7)
      })

    // X axis
    const xAxis = d3.axisBottom(xScale).ticks(10)
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .style('color', '#a89f94')

    // X axis label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e4dd')
      .attr('font-size', 12)
      .text('Glycemic Index (0-100)')

    // Y axis is not needed for beeswarm

    // Title
    if (cuisineId) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e8e4dd')
        .attr('font-size', 13)
        .attr('font-weight', 600)
        .text(`GI Distribution: ${CUISINE_NAMES[cuisineId]}`)
    }
  }, [dimensions, cuisineId])

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        className="w-full border border-gray-800 rounded"
        style={{ height: '300px', backgroundColor: '#0a0a0f' }}
        role="img"
        aria-label="Glycemic index distribution beeswarm plot"
      />

      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 pointer-events-none z-50"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-semibold text-[#d4a574]">{tooltip.name}</div>
          <div>GI: {tooltip.gi}</div>
          <div className="text-slate-400">{tooltip.category}</div>
          <div className="text-slate-500 text-xs">{tooltip.ref}</div>
        </div>
      )}
    </div>
  )
}

export default BeeswarmChart
