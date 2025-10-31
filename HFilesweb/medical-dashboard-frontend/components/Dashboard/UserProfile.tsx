'use client'
import { useState, useEffect } from 'react'
import { User } from '@/types'
import { api } from '@/lib/api'

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      await api.put('/auth/profile', {
        email: user.email,
        gender: user.gender,
        phoneNumber: user.phoneNumber
      })
      setMessage('Profile updated successfully!')
      setIsEditing(false)
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('profileImage', file)

    try {
      const response = await api.post('/auth/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage('Profile image updated!')
      fetchUserProfile()
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to upload image')
    } finally {
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const getProfileImageUrl = (): string => {
    if (user?.profileImage) {
      return `http://localhost:5179${user.profileImage}`
    }
    return '/default-avatar.png'
  }

  if (!user) return <div className="bg-white rounded-lg shadow p-6">Loading...</div>

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">HFiles</h2>
        <h3 className="text-xl font-semibold text-gray-800">{user.fullName}</h3>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 overflow-hidden border-2 border-gray-300">
          <img 
            src={getProfileImageUrl()} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = '/default-avatar.png'
            }}
          />
        </div>
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm transition-colors">
          Change Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          {isEditing ? (
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={user.email}
              onChange={(e) => setUser({...user, email: e.target.value})}
            />
          ) : (
            <p className="px-3 py-2 bg-gray-50 rounded-md">{user.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={user.phoneNumber}
              onChange={(e) => setUser({...user, phoneNumber: e.target.value})}
            />
          ) : (
            <p className="px-3 py-2 bg-gray-50 rounded-md">{user.phoneNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          {isEditing ? (
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="Male"
                  checked={user.gender === 'Male'}
                  onChange={(e) => setUser({...user, gender: e.target.value})}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Male</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="Female"
                  checked={user.gender === 'Female'}
                  onChange={(e) => setUser({...user, gender: e.target.value})}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Female</span>
              </label>
            </div>
          ) : (
            <p className="px-3 py-2 bg-gray-50 rounded-md">{user.gender}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex space-x-3">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  )
}