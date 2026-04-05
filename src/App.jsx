import React from 'react'
import Nav from './components/Nav'
import Hero from './sections/Hero'
import Problem from './sections/Problem'
import Globe from './sections/Globe'
import TopologyExplorer from './sections/TopologyExplorer'
import CompoundDive from './sections/CompoundDive'
import ClinicalTool from './sections/ClinicalTool'
import Moat from './sections/Moat'
import Methodology from './sections/Methodology'

export default function App() {
  return (
    <div className="bg-bg min-h-screen">
      <Nav />
      <Hero />
      <Problem />
      <Globe />
      <TopologyExplorer />
      <CompoundDive />
      <ClinicalTool />
      <Moat />
      <Methodology />
    </div>
  )
}
