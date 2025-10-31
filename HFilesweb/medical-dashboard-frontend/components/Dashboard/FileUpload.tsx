'use client'
import { useState } from 'react'
import { api } from '@/lib/api'

const fileTypes = [
  'Lab Report',
  'Prescription',
  'X-Ray',
  'Blood Report',
  'MRI Scan',
  'CT Scan'
]

export default function FileUpload({ onFileUpload }: { onFileUpload: () => void }) {
  const [formData, setFormData] = useState({
    fileType: '',
    fileName: '',
    file: null as File | null
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.file) {
      setMessage('Please select a file')
      return
    }

    setLoading(true)
    setMessage('')

    const submitData = new FormData()
    submitData.append('fileType', formData.fileType)
    submitData.append('fileName', formData.fileName)
    submitData.append('file', formData.file)

    try {
      await api.post('/medicalfiles/upload', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage('File uploaded successfully!')
      setFormData({ fileType: '', fileName: '', file: null })
      onFileUpload()
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Please Add Your Medical Records</h3>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select file type</label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.fileType}
            onChange={(e) => setFormData({...formData, fileType: e.target.value})}
          >
            <option value="">Select file type</option>
            {fileTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enter Name of File</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., user name and his/her Disease Name"
            value={formData.fileName}
            onChange={(e) => setFormData({...formData, fileName: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select file</label>
          <input
            type="file"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
          />
          <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, JPG, JPEG, PNG</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}