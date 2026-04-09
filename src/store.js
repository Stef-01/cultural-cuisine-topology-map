import { create } from 'zustand'

const useStore = create((set) => ({
  // View mode: 'public' (simplified) or 'researcher' (full detail)
  viewMode: 'public',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Navigation
  activeSection: 0,
  setActiveSection: (idx) => set({ activeSection: idx }),

  // Selected cuisine (used across sections)
  selectedCuisine: null,
  setSelectedCuisine: (id) => set({ selectedCuisine: id }),

  // Hovered cuisine (for cross-component highlighting)
  hoveredCuisine: null,
  setHoveredCuisine: (id) => set({ hoveredCuisine: id }),

  // Clinical tool filters
  clinicalCuisine: 'indian',
  setClinicalCuisine: (id) => set({ clinicalCuisine: id }),
  clinicalCategory: 'all',
  setClinicalCategory: (cat) => set({ clinicalCategory: cat }),

  // Compound explorer
  selectedCompound: null,
  setSelectedCompound: (c) => set({ selectedCompound: c }),

  // Globe state
  globeAutoRotate: true,
  setGlobeAutoRotate: (v) => set({ globeAutoRotate: v }),

  // Scroll progress (0-1)
  scrollProgress: 0,
  setScrollProgress: (v) => set({ scrollProgress: v }),
}))

export default useStore
