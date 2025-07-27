import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  MessageCircle, 
  LogOut,
  Shield,
  Globe
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const Sidebar = () => {
  const { logout, user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navigationItems = [
    { 
      name: t('dashboard'), 
      href: '/dashboard', 
      icon: LayoutDashboard
    },
    { 
      name: t('chat'), 
      href: '/chat', 
      icon: MessageCircle
    }
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">MediChain</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">Welcome, {user?.name || 'User'}</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* Language Selector */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            Language
          </h3>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          {t('logout')}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
