import { useState, useRef } from 'react'
import FileUploader from '../../components/FileUploader'
import { useLanguage } from '../../context/LanguageContext'


export default function Dysgraphia() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const { t } = useLanguage()

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/dysgraphia/analyze', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setError(null)
      setResult(null)
    }
  }

  const resetForm = () => {
    setFile(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center relative">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-teal-400 to-blue-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-[0_2px_10px_rgba(45,212,191,0.3)]">
              {t('dysgraphiaHeading')}
            </span>
          </h1>
          <p className="text-lg text-subtext1 max-w-2xl mx-auto">
            {t('dysgraphiaSub')}
          </p>
        </div>

        {/* Main Content */}
        {!result ? (
          <FileUploader
            file={file}
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
            onReset={resetForm}
            uploading={uploading}
            error={error}
            acceptedTypes="image/*"
            title="Drop your image here"
            subtitle="or click to browse from your device"
            themeColor="teal"
          />
        ) : (
          <div className="glass shadow-2xl rounded-2xl p-8 border border-black/5 relative overflow-hidden">
            {/* Decorative elements for results */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="space-y-8 relative z-10 animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-black/5 pb-6">
                <h2 className="text-2xl font-bold text-text">Analysis Results</h2>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-surface0 hover:bg-surface1 text-subtext0 text-sm font-medium transition-colors"
                >
                  Analyze Another
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-teal-400">Diagnosis</h3>
                  <div className="text-3xl font-bold text-text">{result.status === 'success' && result.result?.confidence > 0.75 ? 'Dysgraphia Likely' : 'Dysgraphia Unlikely'}</div>
                  {result.status === 'success' && result.result && (
                  <>
                  <div className="w-full bg-surface0 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-1000 ease-out"
                      style={{ width: `${result.result.confidence * 100}%` }}
                    />
                  </div>
                  <p className="text-subtext1 text-sm bg-surface0/50 p-2 rounded">
                    Confidence Score: {(result.result.confidence * 100).toFixed(1)}%
                  </p>
                  </>
                  )}
                </div>

                <div className="glass-panel p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-blue-400">Analysis Details</h3>
                  <div className="space-y-2">
                     {result.status === 'success' && result.result?.message && (
                        <p className="text-text">{result.result.message}</p>
                     )}
                     {result.status === 'failure' && (
                        <p className="text-red-400">Analysis failed. Please try again.</p>
                     )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

}
