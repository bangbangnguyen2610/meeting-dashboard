import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  X, Clock, FileText, Tag, CheckCircle2, XCircle,
  Loader2, Calendar, User, Link2, ChevronDown, ChevronUp
} from 'lucide-react'
import { fetchProcessingLogs } from '../lib/supabase'

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  processing: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-400/10' },
}

export default function MeetingDetail({ meeting, onClose }) {
  const [logs, setLogs] = useState([])
  const [showTranscript, setShowTranscript] = useState(false)
  const [showLogs, setShowLogs] = useState(false)

  useEffect(() => {
    if (meeting?.id) {
      fetchProcessingLogs(meeting.id).then(setLogs).catch(console.error)
    }
  }, [meeting?.id])

  if (!meeting) return null

  const transcript = meeting.meeting_transcripts?.[0]
  const summary = transcript?.summary_content || meeting.summary

  return (
    <div className="glass-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">{meeting.title}</h2>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Calendar className="w-4 h-4" />
            {format(new Date(meeting.scheduled_at), "EEEE, dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Status & Meta */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <span className="text-slate-400 text-sm">Trạng thái</span>
            <div className={`flex items-center gap-2 mt-1 ${statusConfig[meeting.status]?.color || 'text-slate-300'}`}>
              {(() => {
                const Icon = statusConfig[meeting.status]?.icon || Clock
                return <Icon className="w-5 h-5" />
              })()}
              <span className="font-medium capitalize">{meeting.status}</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <span className="text-slate-400 text-sm">Số từ transcript</span>
            <div className="flex items-center gap-2 mt-1 text-white">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="font-medium">
                {transcript?.word_count?.toLocaleString() || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Meeting Type */}
        {meeting.dim_meeting_types && (
          <div className="bg-slate-800/50 rounded-xl p-4">
            <span className="text-slate-400 text-sm">Loại cuộc họp</span>
            <div className="flex items-center gap-2 mt-1">
              <Tag className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">{meeting.dim_meeting_types.type_name}</span>
              <span className="text-slate-500">({meeting.dim_meeting_types.type_code})</span>
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Tóm tắt cuộc họp</h3>
            <div className="bg-slate-800/50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-slate-300 text-sm font-sans leading-relaxed">
                  {summary}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Transcript (collapsible) */}
        {transcript?.transcript && (
          <div>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-2 text-lg font-semibold text-white mb-3 hover:text-blue-400 transition-colors"
            >
              {showTranscript ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              Transcript đầy đủ
            </button>
            {showTranscript && (
              <div className="bg-slate-800/50 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-slate-400 text-sm font-sans leading-relaxed">
                  {transcript.transcript}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Processing Logs (collapsible) */}
        {logs.length > 0 && (
          <div>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="flex items-center gap-2 text-lg font-semibold text-white mb-3 hover:text-blue-400 transition-colors"
            >
              {showLogs ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              Processing Logs ({logs.length})
            </button>
            {showLogs && (
              <div className="space-y-2">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      log.status === 'completed' ? 'bg-emerald-500/10' :
                      log.status === 'failed' ? 'bg-red-500/10' : 'bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'completed' ? 'bg-emerald-400' :
                      log.status === 'failed' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    <span className="text-slate-300 font-medium">{log.step}</span>
                    <span className={`text-sm ${
                      log.status === 'completed' ? 'text-emerald-400' :
                      log.status === 'failed' ? 'text-red-400' : 'text-amber-400'
                    }`}>{log.status}</span>
                    <span className="text-slate-500 text-xs ml-auto">
                      {format(new Date(log.created_at), 'HH:mm:ss')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
