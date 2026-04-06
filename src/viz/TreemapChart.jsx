import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { computeUniversalCompounds } from '../data/computed'
import { COMPOUND_FAMILIES } from '../data/constants'

const TreemapChart = () => {
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

    const compounds = computeUniversalCompounds()
    const width = dimensions.width
    const height = dimensions.height

    // Organize data hierarchically: families > compounds
    const familyData = {}
    Object.keys(COMPOUND_FAMILIES).forEach(family => {
      familyData[family] = []
    })
    familyData.other = []

    compounds.forEach(c => {
      if (familyData[c.family]) {
        familyData[c.family].push(c)
      } else {
        familyData.other.push(c)
      }
    })

    const hierarchyData = {
      name: 'root',
      children: Object.entries(familyData)
        .filter(([, compounds]) => compounds.length > 0)
        .map(([family, compounds]) => ({
          name: family,
          children: compounds.slice(0, 15).map(c => ({
            name: c.compound,
            value: c.count,
            family,
          })),
        })),
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.append('title').text('Treemap of flavor compound families across cuisines')

    // Create hierarchy
    const root = d3.hierarchy(hierarchyData).sum(d => d.value)

    // Create treemap layout
    const treemap = d3.treemap().size([width, height]).paddingTop(0).paddingRight(2).paddingBottom(2).paddingLeft(2)

    treemap(root)

    // Color scale
    const families = Object.keys(COMPOUND_FAMILIES)
    const colorScale = d3
      .scaleOrdinal()
      .domain(families)
      .range([
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe', '#fab1a0',
      ])

    // Draw rectangles
    const leaves = root.leaves()
    const nodes = root.descendants()

    // Draw family groups first (parents)
    const families_g = svg
      .selectAll('g.family')
      .data(nodes.filter(d => d.depth === 1))
      .join('g')
      .attr('class', 'family')

    families_g
      .append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', 'none')
      .attr('stroke', d => colorScale(d.data.name))
      .attr('stroke-width', 2)
      .attr('opacity', 0.5)

    families_g
      .append('text')
      .attr('x', d => d.x0 + 4)
      .attr('y', d => d.y0 + 14)
      .attr('font-size', 10)
      .attr('font-weight', 600)
      .attr('fill', d => colorScale(d.data.name))
      .text(d => d.data.name.charAt(0).toUpperCase() + d.data.name.slice(1))

    // Draw compound rectangles
    svg
      .selectAll('g.compound')
      .data(leaves)
      .join('g')
      .attr('class', 'compound')
      .append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScale(d.data.family))
      .attr('opacity', 0.7)
      .attr('stroke', '#0a0a0f')
      .attr('stroke-width', 0.5)
      .on('mouseenter', (event, d) => {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          compound: d.data.name,
          family: d.data.family,
          cuisines: d.data.value,
        })
        d3.select(event.currentTarget).attr('opacity', 1)
      })
      .on('mouseleave', (event) => {
        setTooltip(null)
        d3.select(event.currentTarget).attr('opacity', 0.7)
      })

    // Add labels to compounds
    svg
      .selectAll('text.compound-label')
      .data(leaves)
      .join('text')
      .attr('class', 'compound-label')
      .attr('x', d => d.x0 + 2)
      .attr('y', d => d.y0 + (d.y1 - d.y0) / 2)
      .attr('font-size', d => Math.min(10, (d.x1 - d.x0) / (d.data.name.length * 0.6)))
      .attr('fill', '#e8e4dd')
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('pointer-events', 'none')
      .style('overflow', 'hidden')
      .text(d => (d.x1 - d.x0 > 40 ? d.data.name : ''))

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e4dd')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text('Compound Frequency Treemap (sized by cuisine count)')
  }, [dimensions])

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        className="w-full border border-gray-800 rounded"
        style={{ height: '400px', backgroundColor: '#0a0a0f' }}
        role="img"
        aria-label="Treemap of flavor compound families across cuisines"
      />

      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 pointer-events-none z-50"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-semibold text-[#d4a574]">{tooltip.compound}</div>
          <div className="capitalize text-slate-400">{tooltip.family}</div>
          <div>Shared by {tooltip.cuisines} cuisines</div>
        </div>
      )}
    </div>
  )
}

export default TreemapChart
