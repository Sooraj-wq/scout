import { useState, useRef } from 'react'

export default function Dyslexia() {
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
      const response = await fetch('/api/dyslexia/analyze', {
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

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'text-green'
      case 'moderate': return 'text-yellow'
      case 'high': return 'text-red'
      default: return 'text-text'
    }
  }

  const getRiskBgColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'bg-green/10 border-green/30'
      case 'moderate': return 'bg-yellow/10 border-yellow/30'
      case 'high': return 'bg-red/10 border-red/30'
      default: return 'bg-surface1 border-surface2'
    }
  }

  const getFactorLabel = (key) => {
    const labels = {
      letter_reversals: 'Letter Reversals',
      spacing_inconsistency: 'Spacing Inconsistency',
      baseline_instability: 'Baseline Instability',
      stroke_corrections: 'Stroke Corrections',
      letter_inconsistency: 'Letter Formation Inconsistency'
    }
    return labels[key] || key
  }

  const getProgressBarColor = (score) => {
    if (score < 0.3) return 'bg-green'
    if (score < 0.6) return 'bg-yellow'
    return 'bg-red'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Dyslexia Handwriting Analysis</h1>
        <p className="text-subtext1">
          Upload a handwriting sample for AI-assisted analysis. This tool provides risk assessment based on visual patterns only and is NOT a medical diagnosis.
        </p>
      </div>

      <div className="bg-surface0 rounded-lg shadow-material p-6 mb-6">
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
            {uploading ? 'Analyzing...' : 'Analyze Handwriting'}
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
      </div>

      {result?.analysis && (
        <div className="space-y-6">
          {/* Risk Score Summary */}
          <div className={`p-6 rounded-lg border-2 ${getRiskBgColor(result.analysis.risk_level)}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-text mb-1">
                  Risk Assessment: <span className={getRiskColor(result.analysis.risk_level)}>
                    {result.analysis.risk_level}
                  </span>
                </h2>
                <p className="text-lg font-semibold text-subtext1">
                  Risk Score: {(result.analysis.final_risk_score * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <svg className="h-12 w-12 text-overlay1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="bg-surface1 bg-opacity-60 p-4 rounded-lg">
              <p className="text-sm text-text leading-relaxed">
                {result.analysis.explanation}
              </p>
            </div>

            <div className="mt-4 p-3 bg-blue/10 rounded border border-blue/30">
              <p className="text-xs text-blue font-medium">
                ⚠️ Important: This is NOT a medical diagnosis. Please consult a healthcare professional for proper evaluation.
              </p>
            </div>
          </div>

          {/* Factor Scores */}
          <div className="bg-surface0 rounded-lg shadow-material p-6">
            <h3 className="text-xl font-bold text-text mb-4">Detailed Analysis</h3>
            <div className="space-y-4">
              {Object.entries(result.analysis.factor_scores).map(([key, score]) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-text">
                      {getFactorLabel(key)}
                    </span>
                    <span className="text-sm font-semibold text-text">
                      {(score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-surface2 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(score)}`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-subtext0 mt-1">
                    Weighted contribution: {(result.analysis.weighted_contributions[key] * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Weights Reference */}
          <div className="bg-surface1 rounded-lg p-6">
            <h3 className="text-lg font-bold text-text mb-3">Analysis Weights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-subtext1">Letter Reversals:</span>
                <span className="font-semibold text-text">30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext1">Stroke Corrections:</span>
                <span className="font-semibold text-text">20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext1">Spacing Inconsistency:</span>
                <span className="font-semibold text-text">20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext1">Baseline Instability:</span>
                <span className="font-semibold text-text">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtext1">Letter Inconsistency:</span>
                <span className="font-semibold text-text">15%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
