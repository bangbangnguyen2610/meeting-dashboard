import { useState, useCallback, useEffect } from 'react'
import { Upload as UploadIcon, File, X, CheckCircle, AlertCircle, Loader2, Server } from 'lucide-react'

const API_URL = 'http://localhost:8000'

export default function Upload() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState(null) // 'success' | 'error' | null
  const [message, setMessage] = useState('')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [serverOnline, setServerOnline] = useState(false)

  // Check if local server is running
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${API_URL}/`, { method: 'GET' })
        setServerOnline(res.ok)
      } catch {
        setServerOnline(false)
      }
    }
    checkServer()
    const interval = setInterval(checkServer, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a']

    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp4|webm|mov|mp3|wav|m4a)$/i)) {
      setStatus('error')
      setMessage('Chỉ hỗ trợ file video (mp4, webm, mov) hoặc audio (mp3, wav, m4a)')
      return
    }

    setFile(selectedFile)
    setStatus(null)
    setMessage('')

    // Auto-fill title from filename
    if (!meetingTitle) {
      const name = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
      setMeetingTitle(name)
    }
  }

  const removeFile = () => {
    setFile(null)
    setStatus(null)
    setMessage('')
    setProgress(0)
  }

  const handleUpload = async () => {
    if (!file) return

    if (!serverOnline) {
      setStatus('error')
      setMessage('Local server chưa chạy. Hãy chạy: python local_server.py')
      return
    }

    setUploading(true)
    setProgress(10)
    setStatus(null)
    setMessage('Đang upload file...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', meetingTitle || file.name)

      setProgress(30)
      setMessage('Đang xử lý với Gemini AI...')

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      setProgress(70)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.detail || 'Upload thất bại')
      }

      setProgress(100)
      setStatus('success')
      setMessage(`Thành công! Meeting ID: ${result.meeting_id}`)

      // Reset after success
      setTimeout(() => {
        setFile(null)
        setMeetingTitle('')
        setProgress(0)
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      setStatus('error')
      setMessage(error.message || 'Có lỗi xảy ra khi upload')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Upload Meeting</h1>
        <p className="text-slate-400 mt-1">Tải lên file video hoặc audio để transcribe</p>
      </div>

      <div className="max-w-2xl">
        {/* Server Status */}
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          serverOnline
            ? 'bg-green-500/10 border border-green-500/20'
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          <Server className={`w-5 h-5 ${serverOnline ? 'text-green-400' : 'text-red-400'}`} />
          <div>
            <p className={serverOnline ? 'text-green-400' : 'text-red-400'}>
              {serverOnline ? 'Local Server đang chạy' : 'Local Server offline'}
            </p>
            {!serverOnline && (
              <p className="text-slate-500 text-sm mt-1">
                Chạy lệnh: <code className="bg-slate-800 px-2 py-0.5 rounded">python local_server.py</code>
              </p>
            )}
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tên cuộc họp
          </label>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="VD: Weekly Review - Team Operation"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50
                       transition-colors"
          />
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative glass-card p-8 border-2 border-dashed transition-all cursor-pointer
            ${dragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }
            ${file ? 'border-solid' : ''}
          `}
        >
          <input
            type="file"
            onChange={handleChange}
            accept="video/*,audio/*,.mp4,.webm,.mov,.mp3,.wav,.m4a"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {!file ? (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                <UploadIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Kéo thả file vào đây
              </h3>
              <p className="text-slate-400 mb-4">
                hoặc click để chọn file
              </p>
              <p className="text-slate-500 text-sm">
                Hỗ trợ: MP4, WebM, MOV, MP3, WAV, M4A (không giới hạn dung lượng)
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <File className="w-8 h-8 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{file.name}</p>
                <p className="text-slate-400 text-sm">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">{message}</span>
              <span className="text-sm text-slate-400">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Message */}
        {status && !uploading && (
          <div className={`mt-6 p-4 rounded-xl flex items-center gap-3
            ${status === 'success'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <p className={status === 'success' ? 'text-green-400' : 'text-red-400'}>
              {message}
            </p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading || !serverOnline}
          className="mt-6 w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-600
                     text-white font-medium transition-all disabled:opacity-50
                     disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <UploadIcon className="w-5 h-5" />
              Upload & Transcribe
            </>
          )}
        </button>

        {/* Info */}
        <div className="mt-8 p-4 rounded-xl bg-slate-800/50 border border-white/10">
          <h4 className="text-white font-medium mb-2">Quy trình xử lý:</h4>
          <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
            <li>Upload file lên local server</li>
            <li>Gemini AI transcribe nội dung</li>
            <li>Tạo tóm tắt tự động</li>
            <li>Lưu vào database</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
