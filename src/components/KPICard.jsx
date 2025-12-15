import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KPICard({ title, value, trend, trendValue, icon: Icon, description }) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-400'
    if (trend === 'down') return 'text-red-400'
    return 'text-slate-400'
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div className="glass-card p-6 hover:bg-white/10 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
          )}
          <span className="text-slate-400 text-sm font-medium">{title}</span>
        </div>
      </div>

      <div className="mb-2">
        <span className="text-4xl font-bold text-white">{value}</span>
      </div>

      {(trend || trendValue) && (
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{trendValue}</span>
        </div>
      )}

      {description && (
        <p className="text-slate-500 text-xs mt-2">{description}</p>
      )}
    </div>
  )
}
