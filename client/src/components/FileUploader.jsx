import { useRef } from 'react'

export default function FileUploader({
  file,
  onFileSelect,
  onUpload,
  onReset,
  uploading,
  error,
  acceptedTypes = "image/*",
  title = "Analysis",
  subtitle = "Upload a file to begin",
  themeColor = "teal", // 'teal' or 'mauve'
  Icon,
}) {
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      // Simulate an event object for consistency
      onFileSelect({ target: { files: [droppedFile] } })
    }
  }

  // Theme configuration
  const themes = {
    teal: {
      gradient: "from-teal-400 to-blue-500",
      border: "border-teal-400",
      bgAlert: "bg-teal-400/5",
      hover: "hover:border-teal-400/50",
      shadow: "shadow-teal-500/20",
      text: "text-teal-400",
      button: "bg-gradient-to-r from-teal-400 to-blue-500",
      iconColor: "text-teal-400"
    },
    mauve: {
      gradient: "from-mauve to-pink-500", 
      border: "border-mauve",
      bgAlert: "bg-mauve/5",
      hover: "hover:border-mauve/50",
      shadow: "shadow-mauve/20",
      text: "text-mauve",
      button: "bg-gradient-to-r from-mauve to-pink-500",
      iconColor: "text-mauve"
    }
  }

  const t = themes[themeColor] || themes.teal

  return (
    <div className="glass shadow-2xl rounded-2xl p-8 border border-black/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 ${themeColor === 'mauve' ? 'bg-mauve/10' : 'bg-teal-500/10'} rounded-full blur-3xl`}></div>
      <div className={`absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 ${themeColor === 'mauve' ? 'bg-pink-500/10' : 'bg-blue-500/10'} rounded-full blur-3xl`}></div>

      <div className="space-y-6 relative z-10">
        <div 
          className={`
            border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300
            ${file 
              ? `${t.border} ${t.bgAlert}` 
              : `border-black/10 ${t.hover} hover:bg-white/40`
            }
          `}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={acceptedTypes}
            onChange={onFileSelect}
            className="hidden"
            ref={fileInputRef}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            {file ? (
              <>
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg ${t.shadow}`}>
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-text">{file.name}</p>
                  <p className="text-sm text-subtext1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      onReset()
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="px-4 py-2 rounded-lg bg-surface0 border border-black/5 hover:bg-surface1 transition-colors text-subtext0 font-medium"
                  >
                    Change File
                  </button>
                  <button
                    onClick={onUpload}
                    disabled={uploading}
                    className={`px-6 py-2 rounded-lg ${t.button} text-base shadow-lg ${t.shadow} hover:scale-105 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed text-white`}
                  >
                    {uploading ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Analyzing...</span>
                      </span>
                    ) : 'Start Analysis'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-surface0 border border-black/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  {Icon ? (
                    <Icon className={`w-10 h-10 ${t.iconColor}`} />
                  ) : (
                    <svg className={`w-10 h-10 ${t.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-xl font-medium text-text">{title}</p>
                  <p className="text-subtext1 mt-1">{subtitle}</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-4 ${t.text} hover:opacity-80 font-medium transition-colors`}
                >
                  Select File
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="glass-panel border-l-4 border-red-500 p-4 bg-red-500/10">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
