import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/members', icon: Users, label: 'Members' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ]

  return (
    <aside 
      className="fixed left-0 top-0 h-full w-64 border-r flex flex-col transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--nav-bg)', 
        borderColor: 'var(--border-color)' 
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gradient">Masjidh Sandha</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Management System</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="theme-toggle w-full flex items-center gap-3 px-4 py-3 mb-3"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
            <span className="text-sm font-medium">{user?.full_name?.[0] || 'U'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.full_name || user?.username}</p>
            <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="nav-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar