import { useState, useEffect } from 'react'
import {
  Video, FileText, CheckCircle2, AlertCircle,
  Calendar, RefreshCw, BarChart3
} from 'lucide-react'
import KPICard from './components/KPICard'
import MeetingList from './components/MeetingList'
import MeetingDetail from './components/MeetingDetail'
import StatusChart from './components/StatusChart'
import { fetchMeetings, fetchMeetingStats, fetchMeetingDetail } from './lib/supabase'
import './index.css'

function App() {
  const [meetings, setMeetings] = useState([])
  const [stats, setStats] = useState({ total: 0, completed: 0, failed: 0, processing: 0, thisWeek: 0 })
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [meetingsData, statsData] = await Promise.all([
        fetchMeetings(),
        fetchMeetingStats()
      ])
      setMeetings(meetingsData)
      setStats(statsData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Auto refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSelectMeeting = async (meeting) => {
    try {
      const detail = await fetchMeetingDetail(meeting.id)
      setSelectedMeeting(detail)
    } catch (err) {
      console.error('Error fetching meeting detail:', err)
    }
  }

  const successRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Video className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Meeting Hub</h1>
                <p className="text-slate-400 text-sm">Dashboard tổng hợp cuộc họp</p>
              </div>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10
                         border border-white/10 text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <p>Lỗi: {error}</p>
          </div>
        )}

        {/* KPI Cards - Layer 1: Executive Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Tổng cuộc họp"
            value={stats.total}
            icon={Video}
            description="Tất cả cuộc họp đã xử lý"
          />
          <KPICard
            title="Hoàn thành"
            value={stats.completed}
            trend="up"
            trendValue={`${successRate}% thành công`}
            icon={CheckCircle2}
          />
          <KPICard
            title="Thất bại"
            value={stats.failed}
            trend={stats.failed > 0 ? 'down' : null}
            icon={AlertCircle}
          />
          <KPICard
            title="Tuần này"
            value={stats.thisWeek}
            icon={Calendar}
            description="7 ngày gần đây"
          />
        </div>

        {/* Layer 2: Charts & List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart */}
          <div className="lg:col-span-1">
            <StatusChart stats={stats} />
          </div>

          {/* Middle: Meeting List */}
          <div className="lg:col-span-1">
            <MeetingList
              meetings={meetings}
              onSelect={handleSelectMeeting}
              selectedId={selectedMeeting?.id}
            />
          </div>

          {/* Right: Meeting Detail */}
          <div className="lg:col-span-1">
            {selectedMeeting ? (
              <MeetingDetail
                meeting={selectedMeeting}
                onClose={() => setSelectedMeeting(null)}
              />
            ) : (
              <div className="glass-card p-8 h-full flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-16 h-16 text-slate-700 mb-4" />
                <h3 className="text-lg font-medium text-slate-400 mb-2">
                  Chọn cuộc họp để xem chi tiết
                </h3>
                <p className="text-slate-500 text-sm">
                  Click vào một cuộc họp trong danh sách bên trái để xem tóm tắt và transcript
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-500 text-sm">
            Meeting Hub Dashboard - Powered by Supabase & Gemini AI
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
