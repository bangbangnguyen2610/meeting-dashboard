import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = {
  completed: '#10B981',
  failed: '#EF4444',
  processing: '#F59E0B',
  scheduled: '#3B82F6',
}

const LABELS = {
  completed: 'Hoàn thành',
  failed: 'Thất bại',
  processing: 'Đang xử lý',
  scheduled: 'Đã lên lịch',
}

export default function StatusChart({ stats }) {
  const data = [
    { name: LABELS.completed, value: stats.completed, key: 'completed' },
    { name: LABELS.failed, value: stats.failed, key: 'failed' },
    { name: LABELS.processing, value: stats.processing, key: 'processing' },
  ].filter(d => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="glass-card p-6 h-[300px] flex items-center justify-center">
        <p className="text-slate-400">Chưa có dữ liệu</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Tỉ lệ trạng thái</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
