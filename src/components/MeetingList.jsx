import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CheckCircle2, XCircle, Loader2, Clock, FileText, Calendar } from 'lucide-react'

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Hoàn thành' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Thất bại' },
  processing: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Đang xử lý', animate: true },
  scheduled: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Đã lên lịch' },
}

export default function MeetingList({ meetings, onSelect, selectedId }) {
  if (!meetings || meetings.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Chưa có cuộc họp nào được xử lý</p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Danh sách cuộc họp</h3>
        <p className="text-slate-400 text-sm">{meetings.length} cuộc họp</p>
      </div>

      <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
        {meetings.map((meeting) => {
          const status = statusConfig[meeting.status] || statusConfig.scheduled
          const StatusIcon = status.icon
          const isSelected = selectedId === meeting.id

          return (
            <div
              key={meeting.id}
              onClick={() => onSelect?.(meeting)}
              className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate mb-1">
                    {meeting.title || 'Không có tiêu đề'}
                  </h4>

                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(meeting.scheduled_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </span>

                    {meeting.meeting_transcripts?.[0]?.word_count && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {meeting.meeting_transcripts[0].word_count.toLocaleString()} từ
                      </span>
                    )}
                  </div>

                  {meeting.dim_meeting_types && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-slate-300">
                      {meeting.dim_meeting_types.type_name}
                    </span>
                  )}
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${status.color} ${status.animate ? 'animate-spin' : ''}`} />
                  <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
