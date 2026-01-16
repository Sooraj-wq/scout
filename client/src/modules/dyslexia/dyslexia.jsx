import { useState, useRef } from 'react'
import FileUploader from '../../components/FileUploader'


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
    if (score < 0.3) return 'bg-gradient-to-r from-green to-teal'
    if (score < 0.6) return 'bg-gradient-to-r from-yellow to-peach'
    return 'bg-gradient-to-r from-red to-maroon'
  }

  return (
    <div className="max-w-4xl mx-auto p-8 my-8">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink via-mauve to-blue drop-shadow-[0_2px_10px_rgba(236,72,153,0.3)]">
             Dyslexia Analysis
           </span>
        </h1>
        <div className="glass inline-block px-6 py-2 rounded-full border border-black/5">
          <p className="text-subtext1">
             Upload a handwriting sample for AI-assisted analysis
          </p>
        </div>
      </div>

      {!result?.analysis && (
          <FileUploader
            file={file}
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
            onReset={resetForm}
            uploading={uploading}
            error={error}
            acceptedTypes="image/*,.pdf"
            title="Click to upload or drag and drop"
            subtitle="PNG, JPG, PDF up to 10MB"
            themeColor="mauve"
            Icon={(props) => (
             <svg
              {...props}
              fill="none"
              viewBox="0 0 48 48"
              stroke="currentColor"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            )}
          />
      )}

      {result?.analysis && (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center bg-surface0/30 p-4 rounded-xl border border-black/5">
                <h2 className="text-xl font-bold text-text">Analysis Complete</h2>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-surface0 hover:bg-surface1 text-subtext0 text-sm font-medium transition-colors border border-black/5"
                >
                  Analyze Another
                </button>
            </div>

          {/* Risk Score Summary */}
          <div className={`p-8 rounded-3xl border ${getRiskBgColor(result.analysis.risk_level)} glass backdrop-blur-xl shadow-xl relative overflow-hidden`}>
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <svg className="h-32 w-32" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
               </svg>
             </div>
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div>
                <h2 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
                  Risk Assessment: <span className={`px-3 py-1 rounded-lg bg-black/20 backdrop-blur-md ${getRiskColor(result.analysis.risk_level)}`}>
                    {result.analysis.risk_level}
                  </span>
                </h2>
                <p className="text-xl font-semibold text-subtext1">
                  Risk Score: <span className="text-2xl font-bold text-text">{(result.analysis.final_risk_score * 100).toFixed(1)}%</span>
                </p>
              </div>
            </div>

            <div className="bg-white/40 bg-opacity-60 p-6 rounded-2xl border border-black/5 relative z-10">
              <p className="text-base text-text leading-relaxed">
                {result.analysis.explanation}
              </p>
            </div>

            <div className="mt-6 p-3 bg-blue/10 rounded-xl border border-blue/30 flex items-center gap-2 relative z-10">
               <span className="text-xl">⚠️</span>
              <p className="text-sm text-blue font-bold">
                Important: This is NOT a medical diagnosis. Please consult a healthcare professional for proper evaluation.
              </p>
            </div>
          </div>

          {/* Factor Scores */}
          <div className="glass-panel rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mauve to-blue mb-8">Detailed Analysis</h3>
            <div className="space-y-6">
              {Object.entries(result.analysis.factor_scores).map(([key, score]) => (
                <div key={key} className="glass p-4 rounded-xl border border-black/5 hover:border-black/5 transition-colors">
                  <div className="flex justify-between mb-3 items-end">
                    <span className="text-base font-bold text-lavender">
                      {getFactorLabel(key)}
                    </span>
                    <span className="text-lg font-black text-text">
                      {(score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-surface0/50 rounded-full h-3 backdrop-blur-sm overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ease-out shadow-lg ${getProgressBarColor(score)}`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-subtext1 mt-3 font-medium bg-surface0/30 inline-block px-2 py-1 rounded text-right w-full">
                    Weighted contribution: {(result.analysis.weighted_contributions[key] * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Weights Reference */}
          <div className="glass rounded-2xl p-8 border border-black/5">
            <h3 className="text-xl font-bold text-subtext0 mb-4 uppercase tracking-wider text-sm">Analysis Weights Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between p-3 glass rounded-lg border border-black/5 hover:bg-white/40 transition-colors">
                <span className="text-subtext1">Letter Reversals:</span>
                <span className="font-bold text-blue">30%</span>
              </div>
              <div className="flex justify-between p-3 glass rounded-lg border border-black/5 hover:bg-white/40 transition-colors">
                <span className="text-subtext1">Stroke Corrections:</span>
                <span className="font-bold text-blue">20%</span>
              </div>
              <div className="flex justify-between p-3 glass rounded-lg border border-black/5 hover:bg-white/40 transition-colors">
                <span className="text-subtext1">Spacing Inconsistency:</span>
                <span className="font-bold text-blue">20%</span>
              </div>
              <div className="flex justify-between p-3 glass rounded-lg border border-black/5 hover:bg-white/40 transition-colors">
                <span className="text-subtext1">Baseline Instability:</span>
                <span className="font-bold text-blue">15%</span>
              </div>
              <div className="flex justify-between p-3 glass rounded-lg border border-black/5 hover:bg-white/40 transition-colors">
                <span className="text-subtext1">Letter Inconsistency:</span>
                <span className="font-bold text-blue">15%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
