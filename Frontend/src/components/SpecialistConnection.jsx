import React, { useState } from 'react'
import { UserCheck, Phone, MessageSquare, X } from 'lucide-react'

const SpecialistConnection = ({ isVisible, onClose, onConnect, selectedLanguage, translate }) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState(null)
  const [connectionMethod, setConnectionMethod] = useState('consultation')

  const specialists = [
    {
      id: 'neurologist',
      name: 'Dr. David Kim',
      specialty: 'Neurologist',
      experience: '15+ years',
      rating: 4.9,
      avatar: '🧠'
    },
    {
      id: 'cardiologist',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      experience: '12+ years',
      rating: 4.8,
      avatar: '❤️'
    },
    {
      id: 'general',
      name: 'Dr. Michael Chen',
      specialty: 'General Medicine',
      experience: '10+ years',
      rating: 4.7,
      avatar: '🩺'
    }
  ]

  const handleConnect = () => {
    if (selectedSpecialist) {
      onConnect({
        specialist: selectedSpecialist,
        method: connectionMethod
      })
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="text-purple-600" size={20} />
            {translate('Connect with Specialist', selectedLanguage)}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-600 text-sm mb-4">
            {translate('Based on your consultation, we recommend connecting with a specialist for further evaluation.', selectedLanguage)}
          </p>

          {/* Specialist Selection */}
          <div className="space-y-3 mb-4">
            <h4 className="font-medium text-gray-800">
              {translate('Choose a Specialist:', selectedLanguage)}
            </h4>
            {specialists.map((specialist) => (
              <div
                key={specialist.id}
                onClick={() => setSelectedSpecialist(specialist)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedSpecialist?.id === specialist.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{specialist.avatar}</div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800">{specialist.name}</h5>
                    <p className="text-sm text-gray-600">{specialist.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {specialist.experience}
                      </span>
                      <span className="text-xs text-gray-500">
                        ⭐ {specialist.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Connection Method */}
          {selectedSpecialist && (
            <div className="space-y-3 mb-4">
              <h4 className="font-medium text-gray-800">
                {translate('How would you like to connect?', selectedLanguage)}
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="connectionMethod"
                    value="consultation"
                    checked={connectionMethod === 'consultation'}
                    onChange={(e) => setConnectionMethod(e.target.value)}
                    className="text-purple-600"
                  />
                  <MessageSquare size={16} className="text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">
                      {translate('Online Consultation', selectedLanguage)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {translate('Chat with specialist (Free)', selectedLanguage)}
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="connectionMethod"
                    value="call"
                    checked={connectionMethod === 'call'}
                    onChange={(e) => setConnectionMethod(e.target.value)}
                    className="text-purple-600"
                  />
                  <Phone size={16} className="text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">
                      {translate('Phone Consultation', selectedLanguage)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {translate('Schedule a call (₹500)', selectedLanguage)}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {translate('Maybe Later', selectedLanguage)}
            </button>
            <button
              onClick={handleConnect}
              disabled={!selectedSpecialist}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {translate('Connect Now', selectedLanguage)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecialistConnection
