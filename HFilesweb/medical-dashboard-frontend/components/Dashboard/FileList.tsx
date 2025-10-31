'use client'
import { useState, useEffect } from 'react'
import { MedicalFile } from '@/types'
import { api } from '@/lib/api'

export default function FileList() {
  const [files, setFiles] = useState<MedicalFile[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingFile, setViewingFile] = useState<MedicalFile | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileType, setFileType] = useState<string>('')

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await api.get('/medicalfiles')
      setFiles(response.data)
    } catch (error) {
      console.error('Failed to fetch files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    
    try {
      await api.delete(`/medicalfiles/${fileId}`)
      setFiles(files.filter(file => file.id !== fileId))
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await api.get(`/medicalfiles/download/${fileId}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  const handleView = async (file: MedicalFile) => {
    try {
      setViewingFile(file)
      
      const response = await api.get(`/medicalfiles/download/${file.id}`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data])
      const fileExtension = file.originalFileName.toLowerCase().split('.').pop()
      
      // Determine content type
      let contentType = 'application/octet-stream'
      if (fileExtension === 'pdf') {
        contentType = 'application/pdf'
      } else if (['jpg', 'jpeg'].includes(fileExtension || '')) {
        contentType = 'image/jpeg'
      } else if (fileExtension === 'png') {
        contentType = 'image/png'
      } else if (fileExtension === 'gif') {
        contentType = 'image/gif'
      }
      
      const blobWithType = new Blob([response.data], { type: contentType })
      const blobUrl = window.URL.createObjectURL(blobWithType)
      
      setFileContent(blobUrl)
      setFileType(contentType)
      
    } catch (error: any) {
      console.error('View failed:', error)
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        alert('Failed to view file. Please try downloading instead.')
      }
      setViewingFile(null)
    }
  }

  const closeViewer = () => {
    setViewingFile(null)
    setFileContent(null)
    setFileType('')
    // Clean up blob URL
    if (fileContent && fileContent.startsWith('blob:')) {
      window.URL.revokeObjectURL(fileContent)
    }
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().includes('.pdf')) return '📄'
    if (fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) return '🖼️'
    return '📁'
  }

  const isImageFile = (type: string) => type.startsWith('image/')
  const isPdfFile = (type: string) => type === 'application/pdf'

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
        <div className="text-center py-8">Loading files...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
      
      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No files uploaded yet.</p>
          <p className="text-sm">Upload your first medical file above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{getFileIcon(file.originalFileName)}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {file.fileType}
                </span>
              </div>
              
              <h4 className="font-medium text-gray-900 truncate">{file.fileName}</h4>
              <p className="text-sm text-gray-500 truncate">{file.originalFileName}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
              
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => handleView(file)}
                  className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  title="View file"
                >
                  View
                </button>
                <button
                  onClick={() => handleDownload(file.id, file.originalFileName)}
                  className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-sm hover:bg-green-700 transition-colors"
                  title="Download file"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-sm hover:bg-red-700 transition-colors"
                  title="Delete file"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {viewingFile.fileName}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(viewingFile.id, viewingFile.originalFileName)}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                >
                  Download
                </button>
                <button
                  onClick={closeViewer}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-auto">
              {fileContent ? (
                <div className="flex justify-center">
                  {isImageFile(fileType) ? (
                    <img 
                      src={fileContent} 
                      alt={viewingFile.fileName}
                      className="max-w-full max-h-96 object-contain"
                    />
                  ) : isPdfFile(fileType) ? (
                    <iframe
                      src={fileContent}
                      className="w-full h-96 border-0"
                      title={viewingFile.fileName}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        Preview not available for this file type.
                      </p>
                      <button
                        onClick={() => handleDownload(viewingFile.id, viewingFile.originalFileName)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Download File
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading file...</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="text-sm text-gray-600">
                <p><strong>File Type:</strong> {viewingFile.fileType}</p>
                <p><strong>Original Name:</strong> {viewingFile.originalFileName}</p>
                <p><strong>Uploaded:</strong> {new Date(viewingFile.uploadedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}