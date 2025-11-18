/**
 * Chart Component
 * Simple chart visualization (production: use Recharts or Chart.js)
 */

import React from 'react'
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card'

export interface ChartDataPoint {
  label: string
  value: number
}

export interface ChartProps {
  title: string
  data: ChartDataPoint[]
  type?: 'line' | 'bar' | 'area'
  color?: string
  height?: number
}

export const Chart: React.FC<ChartProps> = ({
  title,
  data,
  type = 'line',
  color = '#00a35c',
  height = 200,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="relative" style={{ height: `${height}px` }}>
          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
            <span>{maxValue}</span>
            <span>{Math.round((maxValue + minValue) / 2)}</span>
            <span>{minValue}</span>
          </div>

          {/* Chart Area */}
          <div className="absolute left-14 right-0 top-0 bottom-8">
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={`${ratio * 100}%`}
                  x2="100%"
                  y2={`${ratio * 100}%`}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Data Visualization */}
              {type === 'bar' &&
                data.map((point, i) => {
                  const barWidth = 100 / data.length
                  const barHeight = ((point.value - minValue) / range) * 100
                  return (
                    <rect
                      key={i}
                      x={`${i * barWidth}%`}
                      y={`${100 - barHeight}%`}
                      width={`${barWidth * 0.8}%`}
                      height={`${barHeight}%`}
                      fill={color}
                      opacity="0.8"
                      className="hover:opacity-100 transition-opacity"
                    />
                  )
                })}

              {type === 'line' && data.length > 1 && (
                <>
                  {/* Line Path */}
                  <path
                    d={data
                      .map((point, i) => {
                        const x = (i / (data.length - 1)) * 100
                        const y = 100 - ((point.value - minValue) / range) * 100
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                      })
                      .join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                  />
                  {/* Data Points */}
                  {data.map((point, i) => {
                    const x = (i / (data.length - 1)) * 100
                    const y = 100 - ((point.value - minValue) / range) * 100
                    return (
                      <circle
                        key={i}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="4"
                        fill={color}
                        className="hover:r-6 transition-all"
                      />
                    )
                  })}
                </>
              )}

              {type === 'area' && data.length > 1 && (
                <path
                  d={
                    data
                      .map((point, i) => {
                        const x = (i / (data.length - 1)) * 100
                        const y = 100 - ((point.value - minValue) / range) * 100
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                      })
                      .join(' ') +
                    ` L 100 100 L 0 100 Z`
                  }
                  fill={color}
                  opacity="0.2"
                  stroke={color}
                  strokeWidth="2"
                />
              )}
            </svg>
          </div>

          {/* X-Axis Labels */}
          <div className="absolute left-14 right-0 bottom-0 h-6 flex justify-between text-xs text-gray-500">
            {data.map((point, i) => (
              <span key={i} className="truncate">
                {point.label}
              </span>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
