'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import UserProfile from '@/components/Dashboard/UserProfile'
import FileUpload from '@/components/Dashboard/FileUpload'
import FileList from '@/components/Dashboard/FileList'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [refreshFiles, setRefreshFiles] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleFileUpload = () => {
    setRefreshFiles(prev => prev + 1)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Medical Record Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - User Profile */}
          <div className="lg:col-span-1">
            <UserProfile />
          </div>
          
          {/* Right Side - File Upload and List */}
          <div className="lg:col-span-2 space-y-8">
            <FileUpload onFileUpload={handleFileUpload} />
            <FileList key={refreshFiles} />
          </div>
        </div>
      </div>
    </div>
  )
}