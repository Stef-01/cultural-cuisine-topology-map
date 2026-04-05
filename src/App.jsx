import React, { lazy, Suspense } from 'react'
import Nav from './components/Nav'
import ErrorBoundary from './components/ErrorBoundary'
import Hero from './sections/Hero'
import Problem from './sections/Problem'

// Lazy-load heavy sections (Three.js globe, D3 viz)
const Globe = lazy(() => import('./sections/Globe'))
const TopologyExplorer = lazy(() => import('./sections/TopologyExplorer'))
const CompoundDive = lazy(() => import('./sections/CompoundDive'))
const ClinicalTool = lazy(() => import('./sections/ClinicalTool'))
const Moat = lazy(() => import('./sections/Moat'))
const Methodology = lazy(() => import('./sections/Methodology'))

function SectionLoader({ label }) {
  return (
    <div className="w-full py-20 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#d4a574] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-500">Loading {label}...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="bg-bg min-h-screen">
      <Nav />
      <Hero />
      <Problem />

      <ErrorBoundary label="3D Globe">
        <Suspense fallback={<SectionLoader label="Globe" />}>
          <Globe />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary label="Topology Explorer">
        <Suspense fallback={<SectionLoader label="Topology Explorer" />}>
          <TopologyExplorer />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary label="Compound Explorer">
        <Suspense fallback={<SectionLoader label="Compound Explorer" />}>
          <CompoundDive />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary label="Clinical Tool">
        <Suspense fallback={<SectionLoader label="Clinical Tool" />}>
          <ClinicalTool />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary label="Traditional vs Modern">
        <Suspense fallback={<SectionLoader label="Traditional vs Modern" />}>
          <Moat />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary label="Methodology">
        <Suspense fallback={<SectionLoader label="Methodology" />}>
          <Methodology />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
