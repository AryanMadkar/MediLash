import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useAudio } from '../contexts/AudioContext'
import { Bell, Search, Settings, User, LogOut, Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Navbar = () => {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { getCurrentLanguage } = useLanguage()
  const { audioEnabled, toggleAudio } = useAudio()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-white/20 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 medical-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-display font-semibold text-xl text-medical-900">
              MediChain
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('navbar.search')}
                className="w-full pl-10 pr-4 py-2 bg-medical-50 border border-medical-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Indicator */}
            <div className="flex items-center space-x-2 text-sm text-medical-600">
              <span>{getCurrentLanguage()?.flag}</span>
              <span>{getCurrentLanguage()?.code.toUpperCase()}</span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-lg transition-colors ${
                audioEnabled 
                  ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
                  : 'text-medical-400 hover:bg-medical-50'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className="p-2 text-medical-600 hover:bg-medical-50 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-medical-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-medical-900">
                  {user?.name || 'User'}
                </span>
              </button>

              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-medical-200 py-2"
                >
                  <button className="w-full px-4 py-2 text-left hover:bg-medical-50 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>{t('navbar.settings')}</span>
                  </button>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('navbar.logout')}</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
