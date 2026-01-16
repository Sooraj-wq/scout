# ADHD Screening Module

A comprehensive neuro-cognitive assessment suite for ADHD screening with AI-powered analysis.

## Setup Instructions

### Backend Setup

1. **Install Dependencies**
```bash
cd /home/rogue/SamasyaAI/scout/server
pip install numpy google-generativeai markdown
```

2. **Set Gemini API Key**
```bash
export GEMINI_API_KEY="your-api-key-here"
```

Get your API key from: https://makersuite.google.com/app/apikey

3. **Start the Server**
```bash
fastapi dev app/main.py
```

Server runs on: http://localhost:8000

### Frontend Setup

1. **Install Dependencies** (if not already done)
```bash
cd /home/rogue/SamasyaAI/scout/client
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

Frontend runs on: http://localhost:5173

## Usage

1. Navigate to: http://localhost:5173 and go to the ADHD module
2. Click "Begin Assessment"
3. Complete all three phases:
   - **Phase 1**: Focus Test (45s) - Press SPACE only on "7"
   - **Phase 2**: Working Memory (45s) - Press SPACE when letter matches 2-back
   - **Phase 3**: Motor Stability (15s) - Tap SPACE at steady rhythm
4. View AI-powered analysis and detailed metrics

## API Endpoints

- `POST /api/adhd/finalize-assessment` - Submit test results for analysis
- `GET /api/adhd/health` - Health check

## Technologies

- **Frontend**: React, Tailwind CSS, Catppuccin Mocha theme
- **Backend**: FastAPI, NumPy, Google Gemini AI
- **Design**: Material 3 principles with rounded components
