import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { computeDendrogram } from '../data/computed'

/**
 * UPGMA Dendrogram — hierarchical clustering of cuisines by Jaccard distance.
 * More interpretable than persistence diagrams at n=10.
 * Rendered as a horizontal dendrogram with cuisine leaf labels on the left.
 */
const DendrogramChart = () => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 })
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

    const { tree } = computeDendrogram()
    const width = dimensions.width
    const height = dimensions.height
    const margin = { top: 30, right: 30, bottom: 30, left: 130 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.append('title').text('UPGMA hierarchical clustering dendrogram of cuisine flavor compound similarity')

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Convert our tree to d3 hierarchy
    function toHierarchy(node) {
      if (node.isLeaf) {
        return { name: node.name, color: node.color, distance: 0 }
      }
      return {
        name: node.id,
        distance: node.distance,
        children: node.children.map(toHierarchy),
      }
    }

    const root = d3.hierarchy(toHierarchy(tree))

    // Count leaves for layout
    let leafCount = 0
    root.eachBefore(d => {
      if (!d.children) leafCount++
    })

    // Custom layout: x = distance, y = leaf position
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(root.descendants(), d => d.data.distance) || 1])
      .range([innerWidth, 0])

    // Assign y positions to leaves
    let leafIdx = 0
    const yStep = innerHeight / (leafCount - 1 || 1)

    function layoutNode(node) {
      if (!node.children) {
        node.y = leafIdx * yStep
        leafIdx++
        node.x = xScale(0)
      } else {
        node.children.forEach(layoutNode)
        node.y = d3.mean(node.children, c => c.y)
        node.x = xScale(node.data.distance)
      }
    }
    layoutNode(root)

    // Draw links (elbow connectors)
    root.descendants().filter(d => d.children).forEach(node => {
      node.children.forEach(child => {
        // Horizontal line from parent to child's y at parent's x
        g.append('line')
          .attr('x1', node.x)
          .attr('y1', child.y)
          .attr('x2', child.x)
          .attr('y2', child.y)
          .attr('stroke', '#64748b')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.6)

        // Vertical line connecting children at parent's x
        g.append('line')
          .attr('x1', node.x)
          .attr('y1', node.children[0].y)
          .attr('x2', node.x)
          .attr('y2', node.children[node.children.length - 1].y)
          .attr('stroke', '#64748b')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.6)
      })
    })

    // Draw internal node merge-distance indicators
    root.descendants().filter(d => d.children).forEach(node => {
      g.append('circle')
        .attr('cx', node.x)
        .attr('cy', node.y)
        .attr('r', 3)
        .attr('fill', '#d4a574')
        .attr('opacity', 0.8)
        .on('mouseenter', (event) => {
          setTooltip({
            x: event.pageX,
            y: event.pageY,
            distance: node.data.distance.toFixed(3),
            jaccard: (1 - node.data.distance).toFixed(3),
          })
        })
        .on('mouseleave', () => setTooltip(null))
    })

    // Draw leaf labels
    const leaves = root.descendants().filter(d => !d.children)
    leaves.forEach(leaf => {
      g.append('circle')
        .attr('cx', leaf.x)
        .attr('cy', leaf.y)
        .attr('r', 5)
        .attr('fill', leaf.data.color || '#a89f94')

      g.append('text')
        .attr('x', leaf.x - 10)
        .attr('y', leaf.y + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', 11)
        .attr('fill', leaf.data.color || '#e8e4dd')
        .attr('font-weight', 600)
        .text(leaf.data.name)
    })

    // X axis (distance)
    const xAxis = d3.axisBottom(xScale).ticks(6)
    g.append('g')
      .attr('transform', `translate(0,${innerHeight + 5})`)
      .call(xAxis)
      .style('color', '#64748b')

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 28)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a89f94')
      .attr('font-size', 10)
      .text('Jaccard Distance (1 - similarity)')

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e4dd')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text('Hierarchical Clustering (UPGMA) — Cuisine Similarity')

  }, [dimensions])

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        className="w-full border border-gray-800 rounded"
        style={{ height: '400px', backgroundColor: '#0a0a0f' }}
        role="img"
        aria-label="UPGMA hierarchical clustering dendrogram of cuisine flavor compound similarity"
      />

      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 pointer-events-none z-50"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-semibold text-[#d4a574]">Merge Point</div>
          <div>Distance: {tooltip.distance}</div>
          <div>Jaccard: {tooltip.jaccard}</div>
        </div>
      )}
    </div>
  )
}

export default DendrogramChart
