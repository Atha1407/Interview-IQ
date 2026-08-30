import React from 'react'
import Card, { CardTitle } from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'
import { Activity, Code, Compass, MessageSquare, Layers } from 'lucide-react'

export const DimensionScores = ({ scores }) => {
  if (!scores) return null

  const dimensions = [
    {
      key: 'technical_accuracy',
      label: 'Technical Accuracy',
      description: 'Correctness of concepts, terminology, and technical reasoning',
      value: scores.technical_accuracy ?? 0,
      icon: Code,
    },
    {
      key: 'relevance',
      label: 'Relevance',
      description: 'How directly and accurately the answer addressed the question prompt',
      value: scores.relevance ?? 0,
      icon: Compass,
    },
    {
      key: 'completeness',
      label: 'Completeness',
      description: 'Depth of coverage, handling of nuances, trade-offs, and examples',
      value: scores.completeness ?? 0,
      icon: Layers,
    },
    {
      key: 'communication',
      label: 'Communication',
      description: 'Clarity, conciseness, structure, and articulate technical delivery',
      value: scores.communication ?? 0,
      icon: MessageSquare,
    },
  ]

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardTitle icon={Activity} className="mb-6">
          Core Dimension Breakdown
        </CardTitle>

        <div className="space-y-6">
          {dimensions.map((dim) => {
            const Icon = dim.icon
            return (
              <div key={dim.key} className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-sm font-semibold text-white">{dim.label}</span>
                </div>
                <ProgressBar
                  label=""
                  description={dim.description}
                  value={dim.value}
                  max={100}
                />
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

export default DimensionScores
