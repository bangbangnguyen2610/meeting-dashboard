import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, Video } from 'lucide-react'

const menuItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Upload Meeting',
    path: '/upload',
    icon: Upload,
  },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <Video className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Meeting Hub</h1>
            <p className="text-slate-500 text-xs">Quản lý cuộc họp</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer
                   ${isActive
                     ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                     : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                   }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <p className="text-xs text-slate-600 text-center">
          Powered by Gemini AI
        </p>
      </div>
    </aside>
  )
}
