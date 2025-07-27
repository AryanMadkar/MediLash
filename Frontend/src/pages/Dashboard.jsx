import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Activity, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { t } = useLanguage()
  const { user } = useAuth()

  const stats = [
    { 
      name: t('totalChats'), 
      value: '24', 
      icon: MessageCircle, 
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    { 
      name: t('todayConsultations'), 
      value: '8', 
      icon: Activity, 
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    { 
      name: 'Response Time', 
      value: '2.3s', 
      icon: Clock, 
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    { 
      name: 'Health Score', 
      value: '85%', 
      icon: TrendingUp, 
      color: 'text-red-600',
      bg: 'bg-red-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-effect rounded-xl p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('welcome')}, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's your health dashboard overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/chat" 
              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-900">{t('startChat')}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600" />
            </Link>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Consultation about headache</span>
              <span className="text-sm text-gray-500">2h ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Voice consultation completed</span>
              <span className="text-sm text-gray-500">1d ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Profile updated</span>
              <span className="text-sm text-gray-500">3d ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
