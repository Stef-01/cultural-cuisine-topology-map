import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { getJaccard, getOverlap, cuisineIds } from '../data/computed'
import { CUISINE_COLORS, CUISINE_NAMES } from '../data/constants'
import useStore from '../store'

const HeatmapChart = () => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 })
  const [tooltip, setTooltip] = useState(null)
  const [selectedPair, setSelectedPair] = useState(null)
  const { setHoveredCuisine } = useStore()

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.clientWidth, 700)
        setDimensions({ width: w, height: w })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!svgRef.current || !dimensions.width) return

    const size = dimensions.width
    const cellSize = size / cuisineIds.length
    const margin = 80

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.append('title').text('Jaccard similarity heatmap between all cuisine pairs')

    // Color scale - dark theme: dark slate to bright accent
    const colorScale = d3.scaleLinear()
      .domain([0, 0.8])
      .range(['#1e293b', '#d4a574'])

    // X axis labels
    svg
      .append('g')
      .attr('transform', `translate(${margin}, 0)`)
      .selectAll('text')
      .data(cuisineIds)
      .join('text')
      .attr('x', (d, i) => i * cellSize + cellSize / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', d => CUISINE_COLORS[d])
      .attr('font-weight', 600)
      .text(d => CUISINE_NAMES[d])

    // Y axis labels
    svg
      .append('g')
      .attr('transform', `translate(0, ${margin})`)
      .selectAll('text')
      .data(cuisineIds)
      .join('text')
      .attr('x', -10)
      .attr('y', (d, i) => i * cellSize + cellSize / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-size', 11)
      .attr('fill', d => CUISINE_COLORS[d])
      .attr('font-weight', 600)
      .text(d => CUISINE_NAMES[d])

    // Heatmap cells
    const cells = []
    for (let i = 0; i < cuisineIds.length; i++) {
      for (let j = 0; j < cuisineIds.length; j++) {
        const c1 = cuisineIds[i]
        const c2 = cuisineIds[j]
        const jaccard = getJaccard(c1, c2)
        const overlap = getOverlap(c1, c2)
        cells.push({
          i,
          j,
          c1,
          c2,
          jaccard,
          sharedCount: overlap?.shared_compounds_count || 0,
        })
      }
    }

    svg
      .append('g')
      .attr('transform', `translate(${margin}, ${margin})`)
      .selectAll('rect')
      .data(cells)
      .join('rect')
      .attr('x', d => d.j * cellSize)
      .attr('y', d => d.i * cellSize)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => colorScale(d.jaccard))
      .attr('stroke', '#0a0a0f')
      .attr('stroke-width', 0.5)
      .on('mouseenter', (event, d) => {
        setHoveredCuisine(d.c1)
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          pair: `${CUISINE_NAMES[d.c1]} × ${CUISINE_NAMES[d.c2]}`,
          jaccard: d.jaccard.toFixed(3),
          shared: d.sharedCount,
        })
      })
      .on('mouseleave', () => {
        setHoveredCuisine(null)
        setTooltip(null)
      })
      .on('click', (event, d) => {
        setSelectedPair(d)
      })

    // Diagonal text
    svg
      .append('g')
      .attr('transform', `translate(${margin}, ${margin})`)
      .selectAll('text')
      .data(cells.filter(d => d.i === d.j))
      .join('text')
      .attr('x', d => d.j * cellSize + cellSize / 2)
      .attr('y', d => d.i * cellSize + cellSize / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('fill', '#a89f94')
      .attr('opacity', 0.6)
      .text('1.00')
  }, [dimensions, setHoveredCuisine])

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        className="w-full border border-gray-800 rounded"
        style={{ backgroundColor: '#0a0a0f' }}
        role="img"
        aria-label="Jaccard similarity heatmap between all cuisine pairs"
      />

      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 pointer-events-none z-50"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-semibold text-[#d4a574]">{tooltip.pair}</div>
          <div>Jaccard: {tooltip.jaccard}</div>
          <div>Shared: {tooltip.shared} compounds</div>
        </div>
      )}

      {selectedPair && (
        <div className="mt-4 p-4 bg-slate-900 border border-slate-700 rounded">
          <div className="text-sm text-slate-300 mb-2">
            Shared compounds between {CUISINE_NAMES[selectedPair.c1]} and {CUISINE_NAMES[selectedPair.c2]}:
          </div>
          <div className="text-xs text-slate-400">
            {selectedPair.sharedCount} compounds (Jaccard: {selectedPair.jaccard.toFixed(3)})
          </div>
        </div>
      )}
    </div>
  )
}

export default HeatmapChart
