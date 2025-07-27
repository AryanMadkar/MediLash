import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, MessageCircle, Globe, Mic } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const Landing = () => {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MediChain</span>
            </div>
            <div className="flex space-x-4">
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Medical
            <span className="text-blue-600"> Assistant</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get instant medical consultations with our multilingual AI assistant. 
            Secure, private, and available 24/7 with voice support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary inline-flex items-center">
              Start Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6 glass-effect rounded-xl">
              <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Chat</h3>
              <p className="text-gray-600">AI understands symptoms and provides guidance.</p>
            </div>
            <div className="text-center p-6 glass-effect rounded-xl">
              <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multilingual</h3>
              <p className="text-gray-600">Communicate in your preferred language.</p>
            </div>
            <div className="text-center p-6 glass-effect rounded-xl">
              <Mic className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Voice Support</h3>
              <p className="text-gray-600">Speak naturally with voice recognition.</p>
            </div>
            <div className="text-center p-6 glass-effect rounded-xl">
              <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600">Your health data is completely private.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing
