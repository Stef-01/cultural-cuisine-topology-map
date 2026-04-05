import React, { useMemo } from 'react'
import ScrollSection from '../components/ScrollSection'
import DumbbellChart from '../viz/DumbbellChart'
import { computeTraditionalVsModern } from '../data/computed'

export default function Moat() {
  const tvmData = useMemo(() => computeTraditionalVsModern(), [])

  return (
    <ScrollSection id="moat" title="Your Grandmother Was Right">
      {/* Narrative Section */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-8 mb-8 text-slate-300 leading-relaxed">
        <p className="mb-4">
          Traditional cuisines evolved over centuries to maximize nutrition while minimizing health risks.
          The foods your grandmother cooked were optimized not just for flavor, but for longevity and resilience.
        </p>
        <p className="mb-4">
          This data reveals a remarkable pattern: the foundational ingredients and dishes that sustained
          populations across generations tend to have glycemic indices concentrated in the 15–45 range.
          These are foods that provide steady energy without blood sugar spikes.
        </p>
        <p>
          But modernity has disrupted this balance. Industrial processing, sugar-dense sauces, refined grains,
          and convenience additions have shifted many cuisines' aggregate profiles toward 55–80+.
          The nutritional wisdom is still there—in the traditional preparations. We just have to choose them.
        </p>
      </div>

      {/* Dumbbell Chart */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 mb-8">
        <DumbbellChart data={tvmData} />
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="border-l-4 border-green-500 bg-green-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-lg text-green-400 mb-3">The Pattern</h3>
          <p className="text-sm text-green-300/90">
            Traditional foods average GI 15–45, providing stable energy release without insulin spikes.
            These are the recipes passed down through generations because they sustained health and vitality.
          </p>
        </div>

        <div className="border-l-4 border-orange-500 bg-orange-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-lg text-orange-400 mb-3">The Disruption</h3>
          <p className="text-sm text-orange-300/90">
            Modern adaptations push averages to 55–80+, introducing refined sugars, processed thickeners,
            and industrial shortcuts. The choice is clear: return to traditional foundations for better health outcomes.
          </p>
        </div>
      </div>
    </ScrollSection>
  )
}
