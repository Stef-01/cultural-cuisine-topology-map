import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { computeIngredientFlow } from '../data/computed'
import { CUISINE_COLORS, CUISINE_NAMES } from '../data/constants'

/**
 * Ingredient → Compound → Cuisine alluvial/flow diagram.
 * Shows how ingredients contribute flavor compounds to cuisines.
 * Uses a simplified 3-column layout with curved links.
 */
const FlowChart = () => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 })
  const [tooltip, setTooltip] = useState(null)
  const [highlightNode, setHighlightNode] = useState(null)

  const flowData = useMemo(() => computeIngredientFlow(), [])

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

  useEffect(() => {
    if (!svgRef.current || !dimensions.width || !flowData) return

    const width = dimensions.width
    const height = dimensions.height
    const margin = { top: 30, right: 20, bottom: 20, left: 20 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.append('title').text('Ingredient to compound to cuisine flavor flow diagram')

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Three columns: ingredients (left), compounds (middle), cuisines (right)
    const colWidth = innerWidth / 3
    const cols = {
      ingredients: colWidth * 0.15,
      compounds: colWidth * 1.5,
      cuisines: colWidth * 2.85,
    }

    // Layout nodes vertically in each column
    const ingNodes = flowData.ingredients.map((ing, i) => ({
      ...ing,
      type: 'ingredient',
      id: ing.name,
      x: cols.ingredients,
      y: (i / (flowData.ingredients.length - 1 || 1)) * innerHeight,
    }))

    const compNodes = flowData.compounds.map((comp, i) => ({
      ...comp,
      type: 'compound',
      id: comp.name,
      x: cols.compounds,
      y: (i / (flowData.compounds.length - 1 || 1)) * innerHeight,
    }))

    const cuisineNodes = flowData.cuisines.map((c, i) => ({
      ...c,
      type: 'cuisine',
      x: cols.cuisines,
      y: (i / (flowData.cuisines.length - 1 || 1)) * innerHeight,
    }))

    const nodeMap = new Map()
    ingNodes.forEach(n => nodeMap.set(n.id, n))
    compNodes.forEach(n => nodeMap.set(n.id, n))
    cuisineNodes.forEach(n => nodeMap.set(n.id, n))

    // Draw links: ingredient → compound
    const linkGroup = g.append('g').attr('class', 'links')

    function drawLink(source, target, color, opacity = 0.08) {
      if (!source || !target) return null
      const midX = (source.x + target.x) / 2
      return linkGroup.append('path')
        .attr('d', `M${source.x},${source.y} C${midX},${source.y} ${midX},${target.y} ${target.x},${target.y}`)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('opacity', opacity)
        .attr('data-source', source.id)
        .attr('data-target', target.id)
    }

    flowData.links.ingToComp.forEach(link => {
      const src = nodeMap.get(link.source)
      const tgt = nodeMap.get(link.target)
      drawLink(src, tgt, '#a89f94')
    })

    flowData.links.compToCuisine.forEach(link => {
      const src = nodeMap.get(link.source)
      const tgt = nodeMap.get(link.target)
      const color = CUISINE_COLORS[link.target] || '#a89f94'
      drawLink(src, tgt, color)
    })

    // Draw ingredient nodes
    const ingGroup = g.append('g')
    ingNodes.forEach(node => {
      const grp = ingGroup.append('g')
        .attr('transform', `translate(${node.x},${node.y})`)
        .style('cursor', 'pointer')

      grp.append('circle')
        .attr('r', 4)
        .attr('fill', '#a89f94')

      grp.append('text')
        .attr('x', -8)
        .attr('text-anchor', 'end')
        .attr('dy', 4)
        .attr('font-size', 9)
        .attr('fill', '#cbd5e1')
        .text(node.name.replace(/_/g, ' '))

      grp.on('mouseenter', (event) => {
        setHighlightNode(node.id)
        setTooltip({
          x: event.pageX, y: event.pageY,
          title: node.name.replace(/_/g, ' '),
          detail: `${node.compoundCount} compounds, ${node.cuisineCount} cuisines`,
        })
        // Highlight connected links
        linkGroup.selectAll('path')
          .attr('opacity', function() {
            const s = d3.select(this).attr('data-source')
            const t = d3.select(this).attr('data-target')
            return s === node.id || t === node.id ? 0.6 : 0.03
          })
          .attr('stroke-width', function() {
            const s = d3.select(this).attr('data-source')
            return s === node.id ? 2.5 : 1.5
          })
      })
      grp.on('mouseleave', () => {
        setHighlightNode(null)
        setTooltip(null)
        linkGroup.selectAll('path').attr('opacity', 0.08).attr('stroke-width', 1.5)
      })
    })

    // Draw compound nodes
    const compGroup = g.append('g')
    compNodes.forEach(node => {
      const grp = compGroup.append('g')
        .attr('transform', `translate(${node.x},${node.y})`)
        .style('cursor', 'pointer')

      grp.append('circle')
        .attr('r', 3 + node.cuisineCount * 0.5)
        .attr('fill', '#d4a574')
        .attr('opacity', 0.7)

      grp.append('text')
        .attr('x', 0)
        .attr('text-anchor', 'middle')
        .attr('dy', -8)
        .attr('font-size', 8)
        .attr('fill', '#a89f94')
        .text(node.name.length > 14 ? node.name.slice(0, 12) + '..' : node.name)

      grp.on('mouseenter', (event) => {
        setHighlightNode(node.id)
        setTooltip({
          x: event.pageX, y: event.pageY,
          title: node.name,
          detail: `Found in ${node.cuisineCount} cuisines`,
        })
        linkGroup.selectAll('path')
          .attr('opacity', function() {
            const s = d3.select(this).attr('data-source')
            const t = d3.select(this).attr('data-target')
            return s === node.id || t === node.id ? 0.6 : 0.03
          })
          .attr('stroke-width', function() {
            const s = d3.select(this).attr('data-source')
            const t = d3.select(this).attr('data-target')
            return s === node.id || t === node.id ? 2.5 : 1.5
          })
      })
      grp.on('mouseleave', () => {
        setHighlightNode(null)
        setTooltip(null)
        linkGroup.selectAll('path').attr('opacity', 0.08).attr('stroke-width', 1.5)
      })
    })

    // Draw cuisine nodes
    const cuisineGroup = g.append('g')
    cuisineNodes.forEach(node => {
      const color = CUISINE_COLORS[node.id] || '#a89f94'
      const grp = cuisineGroup.append('g')
        .attr('transform', `translate(${node.x},${node.y})`)
        .style('cursor', 'pointer')

      grp.append('circle')
        .attr('r', 6)
        .attr('fill', color)

      grp.append('text')
        .attr('x', 10)
        .attr('dy', 4)
        .attr('font-size', 10)
        .attr('fill', color)
        .attr('font-weight', 600)
        .text(node.name)

      grp.on('mouseenter', (event) => {
        setHighlightNode(node.id)
        setTooltip({
          x: event.pageX, y: event.pageY,
          title: CUISINE_NAMES[node.id],
          detail: 'Hover to trace ingredient pathways',
        })
        linkGroup.selectAll('path')
          .attr('opacity', function() {
            const t = d3.select(this).attr('data-target')
            return t === node.id ? 0.6 : 0.03
          })
          .attr('stroke-width', function() {
            const t = d3.select(this).attr('data-target')
            return t === node.id ? 2.5 : 1.5
          })
      })
      grp.on('mouseleave', () => {
        setHighlightNode(null)
        setTooltip(null)
        linkGroup.selectAll('path').attr('opacity', 0.08).attr('stroke-width', 1.5)
      })
    })

    // Column headers
    svg.append('text').attr('x', margin.left + cols.ingredients).attr('y', 18)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b').attr('font-weight', 600)
      .text('Ingredients')
    svg.append('text').attr('x', margin.left + cols.compounds).attr('y', 18)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b').attr('font-weight', 600)
      .text('Compounds')
    svg.append('text').attr('x', margin.left + cols.cuisines).attr('y', 18)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b').attr('font-weight', 600)
      .text('Cuisines')

  }, [dimensions, flowData, highlightNode])

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        className="w-full border border-slate-700/50 rounded"
        style={{ height: '600px', backgroundColor: '#0a0a0f' }}
        role="img"
        aria-label="Ingredient to compound to cuisine flavor flow diagram"
      />

      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 pointer-events-none z-50"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-semibold text-[#d4a574]">{tooltip.title}</div>
          <div>{tooltip.detail}</div>
        </div>
      )}

      <p className="mt-2 text-xs text-slate-600 text-center">
        Hover ingredients, compounds, or cuisines to trace flavor pathways.
        Top {flowData.ingredients.length} ingredients &rarr; Top {flowData.compounds.length} compounds &rarr; 10 cuisines.
      </p>
    </div>
  )
}

export default FlowChart
