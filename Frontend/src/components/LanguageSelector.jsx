import React from 'react'

const LanguageSelector = () => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <select className="px-3 py-1 bg-white border border-medical-300 rounded-md text-sm">
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="es">Spanish</option>
      </select>
    </div>
  )
}

export default LanguageSelector
