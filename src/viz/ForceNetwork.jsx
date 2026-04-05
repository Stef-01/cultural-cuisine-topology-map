import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { getJaccard, sortedPairs, cuisineIds, data } from '../data/computed'
import { CUISINE_COLORS, CUISINE_NAMES } from '../data/constants'
import useStore from '../store'

const ForceNetwork = () => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [searchTerm, setSearchTerm] = useState('')
  const { hoveredCuisine, setHoveredCuisine, selectedCuisine, setSelectedCuisine } = useStore()
  const hoveredRef = useRef(null)
  const selectedRef = useRef(null)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 600,
        })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Update refs when store changes
  useEffect(() => {
    hoveredRef.current = hoveredCuisine
  }, [hoveredCuisine])

  useEffect(() => {
    selectedRef.current = selectedCuisine
  }, [selectedCuisine])

  // Build and render force network
  useEffect(() => {
    if (!svgRef.current || !dimensions.width) return

    const width = dimensions.width
    const height = dimensions.height

    // Prepare nodes with real compound data
    const nodes = cuisineIds.map(id => ({
      id,
      name: CUISINE_NAMES[id],
      color: CUISINE_COLORS[id],
      compoundCount: data.cuisines[id]?.unique_named_compounds || 0,
    }))

    // Prepare links from top 25 pairs
    const links = sortedPairs.slice(0, 25).map(pair => ({
      source: pair.c1,
      target: pair.c2,
      jaccard: pair.jaccard,
    }))

    // Create SVG
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Define filter for glow
    const defs = svg.append('defs')
    const filter = defs.append('filter').attr('id', 'glow')
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', 4)
      .attr('result', 'coloredBlur')
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .strength(d => 0.3 + d.jaccard * 0.5)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(d => 12 + d.compoundCount / 18))

    // Render edges with curved bezier paths
    const edges = svg
      .append('g')
      .attr('stroke', '#a89f94')
      .attr('stroke-opacity', 0.3)
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke-width', d => 0.5 + d.jaccard * 5)
      .attr('stroke', d => {
        const c1 = CUISINE_COLORS[d.source.id || d.source]
        const c2 = CUISINE_COLORS[d.target.id || d.target]
        return interpolateColor(c1, c2)
      })
      .attr('stroke-opacity', 0.3)
      .attr('data-source', d => d.source.id || d.source)
      .attr('data-target', d => d.target.id || d.target)

    // Render nodes
    const nodeGroups = svg
      .append('g')
      .attr('stroke', '#e8e4dd')
      .attr('stroke-width', 2)
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('data-cuisine', d => d.id)

    const circles = nodeGroups
      .append('circle')
      .attr('r', d => 12 + d.compoundCount / 18)
      .attr('fill', d => d.color)
      .attr('opacity', 0.85)

    nodeGroups
      .append('circle')
      .attr('r', d => 12 + d.compoundCount / 18)
      .attr('fill', 'none')
      .attr('stroke', d => lightenColor(d.color, 1.3))
      .attr('stroke-width', 2)
      .attr('opacity', 0.5)

    const labels = nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => 12 + d.compoundCount / 18 + 16)
      .attr('font-size', 11)
      .attr('fill', '#e8e4dd')
      .attr('font-weight', 500)
      .text(d => d.name)

    // Add drag behavior
    nodeGroups.call(
      d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    )

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Interactions
    nodeGroups.on('mouseenter', function (event, d) {
      setHoveredCuisine(d.id)
      const nodeId = d.id

      // Highlight connected nodes
      nodeGroups.style('opacity', node => {
        const isConnected = node.id === nodeId ||
          links.some(link =>
            (link.source.id === nodeId && link.target.id === node.id) ||
            (link.target.id === nodeId && link.source.id === node.id)
          )
        return isConnected ? 1 : 0.3
      })

      // Highlight connected edges
      edges.style('opacity', e => {
        const src = e.source.id || e.source
        const tgt = e.target.id || e.target
        return (src === nodeId || tgt === nodeId) ? 0.8 : 0.1
      })

      // Show Jaccard percentage labels on edges
      const edgeLabels = svg
        .append('g')
        .attr('class', 'edge-labels')
        .selectAll('text')
        .data(links.filter(link => {
          const src = link.source.id || link.source
          const tgt = link.target.id || link.target
          return src === nodeId || tgt === nodeId
        }))
        .join('text')
        .attr('font-size', 9)
        .attr('fill', '#d4a574')
        .attr('text-anchor', 'middle')
        .attr('pointer-events', 'none')
        .text(e => `${(e.jaccard * 100).toFixed(0)}%`)

      // Enlarge hovered node
      d3.select(this)
        .select('circle:first-of-type')
        .transition()
        .duration(200)
        .attr('r', d => 12 + d.compoundCount / 18 + 4)
    })

    nodeGroups.on('mouseleave', () => {
      setHoveredCuisine(null)
      nodeGroups.style('opacity', 1)
      edges.style('opacity', 0.3)
      circles.transition().duration(200).attr('r', d => 12 + d.compoundCount / 18)
      svg.selectAll('g.edge-labels').remove()
    })

    nodeGroups.on('click', (event, d) => {
      setSelectedCuisine(d.id)
    })

    // Handle search term highlighting
    const tick = () => {
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase()
        nodeGroups.style('opacity', node =>
          node.id.includes(lowerSearch) || node.name.toLowerCase().includes(lowerSearch) ? 1 : 0.2
        )
      }
    }

    // Tick handler
    simulation.on('tick', () => {
      edges.attr('d', d => {
        const x0 = d.source.x
        const y0 = d.source.y
        const x1 = d.target.x
        const y1 = d.target.y
        const dx = x1 - x0
        const dy = y1 - y0
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5
        return `M${x0},${y0}Q${(x0 + x1) / 2 + dr / 2},${(y0 + y1) / 2},${x1},${y1}`
      })

      nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`)
      tick()
    })

    return () => simulation.stop()
  }, [dimensions, searchTerm, setHoveredCuisine, setSelectedCuisine])

  return (
    <div ref={containerRef} className="w-full">
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search cuisines..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-2 rounded bg-slate-900 text-slate-200 placeholder-slate-500 border border-slate-700"
        />
      </div>

      <svg
        ref={svgRef}
        className="w-full border border-slate-700 rounded"
        style={{ height: '600px', backgroundColor: '#0a0a0f' }}
      />

      {/* Legend - show ALL 10 cuisines */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {cuisineIds.map(id => (
          <div key={id} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CUISINE_COLORS[id] }}
            />
            <span className="text-slate-300">{CUISINE_NAMES[id]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper: interpolate between two hex colors
function interpolateColor(color1, color2, t = 0.5) {
  const c1 = parseInt(color1.slice(1), 16)
  const c2 = parseInt(color2.slice(1), 16)
  const r = Math.round((c1 >> 16 & 255) * (1 - t) + (c2 >> 16 & 255) * t)
  const g = Math.round((c1 >> 8 & 255) * (1 - t) + (c2 >> 8 & 255) * t)
  const b = Math.round((c1 & 255) * (1 - t) + (c2 & 255) * t)
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

// Helper: lighten a hex color
function lightenColor(hex, factor = 1.2) {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.round((num >> 16) * factor))
  const g = Math.min(255, Math.round(((num >> 8) & 255) * factor))
  const b = Math.min(255, Math.round((num & 255) * factor))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

export default ForceNetwork
