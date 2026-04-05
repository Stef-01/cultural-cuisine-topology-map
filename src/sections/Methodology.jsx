import React from 'react'
import ScrollSection from '../components/ScrollSection'
import { DATA_SOURCES } from '../data/constants'

export default function Methodology() {
  return (
    <ScrollSection id="methodology" title="Methodology & Sources">
      {/* Pipeline Visualization */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-8 mb-8">
        <h3 className="text-lg font-semibold mb-6 text-slate-200">Data Pipeline</h3>
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="bg-blue-900/30 text-blue-300 px-6 py-3 rounded-lg font-semibold mb-2">
              Ingredients
            </div>
            <div className="text-xs text-slate-400">Raw ingredient database</div>
          </div>
          <div className="text-2xl text-slate-600 mx-2">→</div>
          <div className="flex-1 text-center">
            <div className="bg-purple-900/30 text-purple-300 px-6 py-3 rounded-lg font-semibold mb-2">
              Compounds
            </div>
            <div className="text-xs text-slate-400">Flavor compounds extracted</div>
          </div>
          <div className="text-2xl text-slate-600 mx-2">→</div>
          <div className="flex-1 text-center">
            <div className="bg-green-900/30 text-green-300 px-6 py-3 rounded-lg font-semibold mb-2">
              Cuisines
            </div>
            <div className="text-xs text-slate-400">Aggregated meals</div>
          </div>
          <div className="text-2xl text-slate-600 mx-2">→</div>
          <div className="flex-1 text-center">
            <div className="bg-orange-900/30 text-orange-300 px-6 py-3 rounded-lg font-semibold mb-2">
              Analysis
            </div>
            <div className="text-xs text-slate-400">Jaccard, TDA, Entropy</div>
          </div>
          <div className="text-2xl text-slate-600 mx-2">→</div>
          <div className="flex-1 text-center">
            <div className="bg-red-900/30 text-red-300 px-6 py-3 rounded-lg font-semibold mb-2">
              Viz
            </div>
            <div className="text-xs text-slate-400">Interactive dashboards</div>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-8 mb-8">
        <h3 className="text-lg font-semibold mb-6 text-slate-200">Data Sources & Citations</h3>
        <div className="space-y-6">
          {DATA_SOURCES && Array.isArray(DATA_SOURCES) && DATA_SOURCES.map((source, idx) => (
            <div key={idx} className="border-b border-slate-700/50 pb-6 last:border-b-0">
              <h4 className="font-semibold text-slate-200">{source.cite || 'Source'}</h4>
              {source.detail && (
                <p className="text-sm text-slate-400 mt-2">{source.detail}</p>
              )}
              {source.ref && (
                <p className="text-xs text-slate-500 mt-2 italic">{source.ref}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="bg-amber-900/20 border-l-4 border-amber-500 rounded-lg p-6">
        <h3 className="font-semibold text-amber-300 mb-3">Limitations & Disclaimers</h3>
        <ul className="text-sm text-amber-200/90 space-y-2">
          <li>• Glycemic Index values are measured under controlled laboratory conditions and may vary by individual factors, food preparation, and ripeness.</li>
          <li>• Compound extraction is based on published flavor chemistry literature; not all flavor constituents may be captured.</li>
          <li>• Cuisine categorization reflects culinary traditions; boundaries are not strict and overlap is expected.</li>
          <li>• This analysis is for educational purposes and should not replace medical advice from healthcare professionals.</li>
          <li>• Individual responses to foods vary; consult a registered dietitian for personalized guidance.</li>
        </ul>
      </div>
    </ScrollSection>
  )
}
