import { useState, useRef } from 'react'

export default function Dysgraphia() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-text mb-8">Dysgraphia Analysis</h1>
      
      <div className="bg-surface0 rounded-lg shadow-material p-6">
        <div
          className="border-2 border-dashed border-surface2 rounded-lg p-8 text-center hover:border-overlay0 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <svg
            className="mx-auto h-12 w-12 text-overlay1 mb-4"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf"
            id="file-upload"
          />

          <label
            htmlFor="file-upload"
            className="cursor-pointer text-blue hover:text-sky font-medium"
          >
            Click to upload or drag and drop
          </label>

          <p className="text-subtext0 text-sm mt-2">
            PNG, JPG, PDF up to 10MB
          </p>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-surface1 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-overlay1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-text">{file.name}</span>
                <span className="ml-2 text-sm text-subtext1">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                onClick={resetForm}
                className="text-red hover:text-maroon text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 bg-blue text-base py-2 px-4 rounded-lg font-medium hover:bg-sky disabled:bg-surface2 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Analyzing...' : 'Analyze for Dysgraphia'}
          </button>

          {file && (
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-surface2 rounded-lg font-medium text-text hover:bg-surface1 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red/10 border border-red/30 rounded-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-red mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className={`mt-4 p-4 rounded-lg border ${
            result.status === 'success' 
              ? 'bg-green/10 border-green/30' 
              : 'bg-red/10 border-red/30'
          }`}>
            <div className="flex">
              <svg className={`h-5 w-5 mr-2 ${
                result.status === 'success' ? 'text-green' : 'text-red'
              }`} fill="currentColor" viewBox="0 0 20 20">
                {result.status === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
              <div className="flex-1">
                <h3 className={`text-sm font-medium mb-2 ${
                  result.status === 'success' ? 'text-green' : 'text-red'
                }`}>
                  {result.status === 'success' ? 'Analysis Complete' : 'Analysis Failed'}
                </h3>
                {result.status === 'success' && result.result && (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${
                      result.result.confidence > 0.75 
                        ? 'bg-red/10 border border-red/30' 
                        : 'bg-blue/10 border border-blue/30'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${
                          result.result.confidence > 0.75 ? 'text-red' : 'text-blue'
                        }`}>
                          {result.result.confidence > 0.75 ? 'Dysgraphia Likely' : 'Dysgraphia Unlikely'}
                        </span>
                        <span className={`text-sm font-bold ${
                          result.result.confidence > 0.75 ? 'text-red' : 'text-blue'
                        }`}>
                          {(result.result.confidence * 100).toFixed(1)}% confidence
                        </span>
                      </div>
                      <div className="w-full bg-surface2 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            result.result.confidence > 0.75 ? 'bg-red' : 'bg-blue'
                          }`}
                          style={{ width: `${result.result.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                    {result.result.message && (
                      <div className="bg-surface1 p-3 rounded border border-surface2">
                        <p className="text-sm text-text">{result.result.message}</p>
                      </div>
                    )}
                  </div>
                )}
                {result.status === 'failure' && result.result && (
                  <div className="text-red">
                    <strong>Error:</strong>
                    <pre className="mt-2 bg-red/10 p-2 rounded">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
