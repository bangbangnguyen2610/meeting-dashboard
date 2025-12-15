import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iuadezkhfzcvkvgmhupe.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YWRlemtoZnpjdmt2Z21odXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTkyNDQsImV4cCI6MjA4MDc5NTI0NH0.mlDh2GfgnG0Q54CXnTGsZ_3WjhfChPLh9eeK9eZdLYc'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Fetch all meetings with related data
export async function fetchMeetings() {
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      dim_meeting_types (type_code, type_name),
      meeting_transcripts (word_count, summary_content)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Fetch meeting stats
export async function fetchMeetingStats() {
  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('status, created_at')

  if (error) throw error

  const total = meetings.length
  const completed = meetings.filter(m => m.status === 'completed').length
  const failed = meetings.filter(m => m.status === 'failed').length
  const processing = meetings.filter(m => m.status === 'processing').length

  // Meetings this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeek = meetings.filter(m => new Date(m.created_at) > weekAgo).length

  return { total, completed, failed, processing, thisWeek }
}

// Fetch single meeting detail
export async function fetchMeetingDetail(id) {
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      dim_meeting_types (type_code, type_name),
      meeting_transcripts (transcript, word_count, summary_content),
      meeting_tags (
        dim_tags (tag_name, tag_category)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Fetch processing logs for a meeting
export async function fetchProcessingLogs(meetingId) {
  const { data, error } = await supabase
    .from('processing_logs')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}
