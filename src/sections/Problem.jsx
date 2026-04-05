import ScrollSection from '../components/ScrollSection'
import { CUISINE_COLORS, CUISINE_NAMES } from '../data/constants'

/**
 * GI Value Badge Component
 */
function GIBadge({ value, isHigh }) {
  const bgColor = isHigh ? '#c94c4c' : '#6a9968'
  const textColor = '#fff'

  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      GI {value}
    </span>
  )
}

/**
 * Example Card for cultural substitutions
 */
function ExampleCard({ cuisine, oldFood, oldGI, newFood, newGI, color }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between gap-4">
      {/* Old Food */}
      <div className="flex-1">
        <p className="text-slate-400 text-sm mb-2">{oldFood}</p>
        <GIBadge value={oldGI} isHigh={true} />
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0">
        <svg className="w-5 h-5 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>

      {/* New Food */}
      <div className="flex-1">
        <p className="text-slate-300 text-sm mb-2 font-semibold">{newFood}</p>
        <GIBadge value={newGI} isHigh={false} />
      </div>
    </div>
  )
}

/**
 * Problem/Solution section with before-after examples
 */
export const Problem = () => {
  const examples = [
    {
      cuisine: 'Tamil',
      oldFood: 'White rice dosa',
      oldGI: 78,
      newFood: 'Ragi dosa',
      newGI: 45,
      color: CUISINE_COLORS.indian,
    },
    {
      cuisine: 'Ethiopian',
      oldFood: 'Corn injera',
      oldGI: 74,
      newFood: 'Teff injera',
      newGI: 65,
      color: CUISINE_COLORS.ethiopian,
    },
    {
      cuisine: 'Korean',
      oldFood: 'White rice gruel',
      oldGI: 93,
      newFood: 'Barley rice mix',
      newGI: 68,
      color: CUISINE_COLORS.korean,
    },
    {
      cuisine: 'Peruvian',
      oldFood: 'White rice',
      oldGI: 89,
      newFood: 'Quinoa',
      newGI: 35,
      color: CUISINE_COLORS.peruvian,
    },
  ]

  return (
    <ScrollSection id="problem" className="w-full py-20 px-4 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#d4a574]">
          The Mediterranean Bias
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL: THE PROBLEM */}
          <div className="bg-slate-900/50 border-2 border-red-900/50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-red-400 mb-6">THE PROBLEM</h3>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300">One-size-fits-all dietary guidance</span>
              </li>

              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300">85% of the world doesn't eat Mediterranean</span>
              </li>

              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300">Cultural disconnect → poor adherence</span>
              </li>

              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300">Food is identity — you can't just 'switch cuisines'</span>
              </li>
            </ul>
          </div>

          {/* RIGHT PANEL: THE SOLUTION */}
          <div className="bg-slate-900/50 border-2 border-green-900/50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-green-400 mb-6">THE SOLUTION</h3>

            <p className="text-slate-300 text-sm mb-6">
              Culturally authentic substitutions with proven GI improvements:
            </p>

            <div className="space-y-4">
              {examples.map((example, idx) => (
                <ExampleCard key={idx} {...example} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom insight */}
        <div className="mt-12 bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-[#d4a574]/30 rounded-lg p-6">
          <p className="text-slate-300 text-center">
            <span className="text-[#d4a574] font-semibold">Every cuisine has solutions.</span> By mapping flavor molecule chemistry and glycemic impact, we can find healthier options within the foods you already love.
          </p>
        </div>
      </div>
    </ScrollSection>
  )
}

export default Problem
