# SCOUT - Student Cognitive Observation & Understanding Tool

SCOUT is a comprehensive, AI-powered screening suite designed for the early detection and assessment of specific learning disabilities (SLDs) and neurodevelopmental disorders. It combines gamified interactive tests with computer vision and generative AI to provide accessible, non-invasive screenings for Dysgraphia, Dyslexia, Dyscalculia, ADHD, and Dyspraxia.

Built with a focus on accessibility, the platform supports both English and Malayalam.

## Modules

### 1. Dysgraphia Analysis
- **Handwriting Assessment**: Users upload samples of handwriting.
- **AI Analysis**: Uses deep learning (Gemini 2.5) to analyze visual patterns such as baseline instability, letter reversals, spacing inconsistency, and stroke corrections.
- **Scoring**: Provides risk assessment levels and detailed factor breakdowns.

### 2. Dyslexia Screening
- **Multi-Modal Testing**:
  - **Handwriting Mode**: Analyzes written text for dyslexic indicators (mirror writing, reversals).
  - **Reading Fluency Mode**: Uses Speech-to-Text (Web Speech API) to track Words Per Minute (WPM) and accuracy.
- **AI Summary**: Generates a compassionate, qualitative assessment of reading patterns using LLMs.

### 3. Dyscalculia (Math)
- **Gamified Tasks**: Interactive checks for number sense, arithmetic, and symbol recognition.
- **Reaction Time**: Measures processing speed for numerical tasks.

### 4. ADHD Assessment
- **Focus & Impulse Control**: Uses randomized visual tests to measure attention span and inhibition control.
- **Logic**: "Bag Randomization" ensures distinct stimulus distribution to prevent pattern prediction.

### 5. Dyspraxia (Motor Skills)
- **Air Canvas**: Utilizes MediaPipe Hand Tracking to let users draw geometric shapes in the air using their fingers.
- **Geometric Scoring**: Calculates circularity, radius standard deviation, and angular coverage to differentiate between intentional shapes and poor motor control.

## Tech Stack

**Frontend**
- **Framework**: React (Vite)
- **Styling**: TailwindCSS (Glassmorphism UI)
- **AI/ML**: MediaPipe (Hand Tracking), Web Speech API
- **State**: React Context (Language/Locale)

**Backend**
- **Framework**: FastAPI (Python)
- **AI Models**: Google Gemini 2.5 Flash, OpenCV, NumPy
- **storage**: Temporary local storage for processing uploads

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/scout.git
   cd scout
   ```

2. **Backend Setup**
   ```bash
   cd server
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   # Create a .env file in /server and add:
   # GEMINI_API_KEY=your_key_here
   
   # Run the server
   fastapi dev app/main.py
   ```

3. **Frontend Setup**
   ```bash
   cd client
   
   # Install dependencies
   npm install
   
   # Run the development server
   npm run dev
   ```

## Key Features
- **Localization**: Full support for English and Malayalam, switchable via a floating toggle.
- **Privacy-First**: Voice analysis for reading tests acts as a pass-through; raw audio is not persistently stored.
- **Visual Reports**: Results are presented with clear, color-coded risk levels and interactive charts.

## License
MIT
