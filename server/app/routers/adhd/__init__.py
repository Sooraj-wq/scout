from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
import os
from google import genai
from google.genai import types

router = APIRouter(tags=["adhd"])

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None

class SARTData(BaseModel):
    reactionTimes: List[float]
    commissionErrors: int
    correctHits: int
    totalSevens: int

class WorkingMemoryData(BaseModel):
    sequence: List[str]
    correctResponses: int
    incorrectResponses: int
    totalTargets: int
    accuracy: float

class TappingData(BaseModel):
    tapTimestamps: List[float]
    interTapIntervals: List[float]
    totalTaps: int

class AssessmentData(BaseModel):
    sart: SARTData
    workingMemory: WorkingMemoryData
    tapping: TappingData

class AssessmentResponse(BaseModel):
    metrics: dict
    analysis: str

@router.post("/finalize-assessment", response_model=AssessmentResponse)
async def finalize_assessment(data: AssessmentData):
    """
    Process ADHD assessment data and generate AI-powered analysis
    """
    try:
        # Step 1: Calculate Statistical Metrics
        metrics = calculate_metrics(data)
        
        # Step 2: Generate AI Analysis
        analysis = await generate_ai_analysis(metrics, data)
        
        return AssessmentResponse(
            metrics=metrics,
            analysis=analysis
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def calculate_metrics(data: AssessmentData) -> dict:
    """Calculate statistical metrics from test data"""
    
    # SART Metrics
    sart_metrics = {}
    if data.sart.reactionTimes:
        rt_array = np.array(data.sart.reactionTimes)
        sart_metrics = {
            "meanReactionTime": float(np.mean(rt_array)),
            "stdReactionTime": float(np.std(rt_array)),
            "minReactionTime": float(np.min(rt_array)),
            "maxReactionTime": float(np.max(rt_array)),
            "commissionErrors": data.sart.commissionErrors,
            "correctHits": data.sart.correctHits,
            "totalSevens": data.sart.totalSevens,
            "accuracy": (data.sart.correctHits / data.sart.totalSevens * 100) if data.sart.totalSevens > 0 else 0,
        }
    else:
        sart_metrics = {
            "meanReactionTime": 0,
            "stdReactionTime": 0,
            "commissionErrors": data.sart.commissionErrors,
            "correctHits": data.sart.correctHits,
            "totalSevens": data.sart.totalSevens,
            "accuracy": 0,
        }
    
    # Working Memory Metrics
    wm_metrics = {
        "accuracy": data.workingMemory.accuracy,
        "correctResponses": data.workingMemory.correctResponses,
        "incorrectResponses": data.workingMemory.incorrectResponses,
        "totalTargets": data.workingMemory.totalTargets,
    }
    
    # Tapping Metrics (Motor Stability)
    tapping_metrics = {}
    if data.tapping.interTapIntervals:
        iti_array = np.array(data.tapping.interTapIntervals)
        tapping_metrics = {
            "meanInterval": float(np.mean(iti_array)),
            "variance": float(np.var(iti_array)),
            "stdInterval": float(np.std(iti_array)),
            "coefficientOfVariation": float(np.std(iti_array) / np.mean(iti_array) * 100) if np.mean(iti_array) > 0 else 0,
            "totalTaps": data.tapping.totalTaps,
        }
    else:
        tapping_metrics = {
            "meanInterval": 0,
            "variance": 0,
            "totalTaps": data.tapping.totalTaps,
        }
    
    return {
        "sart": sart_metrics,
        "workingMemory": wm_metrics,
        "tapping": tapping_metrics,
    }

async def generate_ai_analysis(metrics: dict, data: AssessmentData) -> str:
    """Generate AI-powered cognitive analysis using Gemini"""
    
    if not GEMINI_API_KEY:
        return "<p><strong>⚠️ AI Analysis Unavailable</strong></p><p>Please set the GEMINI_API_KEY environment variable to enable AI-powered insights.</p>"
    
    try:
        # Prepare prompt with metrics
        prompt = f"""You are a Neuro-Cognitive Analyst specializing in ADHD assessment interpretation.

Analyze the following cognitive test results and provide a supportive, insightful summary:

**Focus Stability Test (SART):**
- Mean Reaction Time: {metrics['sart']['meanReactionTime']:.0f}ms
- Reaction Time Variability (SD): {metrics['sart'].get('stdReactionTime', 0):.0f}ms
- Commission Errors: {metrics['sart']['commissionErrors']}
- Correct Hits: {metrics['sart']['correctHits']} / {metrics['sart']['totalSevens']}
- Accuracy: {metrics['sart']['accuracy']:.1f}%

**Working Memory Test (2-Back):**
- Accuracy: {metrics['workingMemory']['accuracy']:.1f}%
- Correct Responses: {metrics['workingMemory']['correctResponses']}
- Total Targets: {metrics['workingMemory']['totalTargets']}

**Motor Stability Test (Finger Tapping):**
- Mean Tap Interval: {metrics['tapping']['meanInterval']:.0f}ms
- Interval Variance: {metrics['tapping']['variance']:.0f}
- Coefficient of Variation: {metrics['tapping'].get('coefficientOfVariation', 0):.1f}%
- Total Taps: {metrics['tapping']['totalTaps']}

Provide a concise analysis covering:
1. **Focus & Attention**: Comment on sustained attention and impulse control
2. **Working Memory**: Evaluate cognitive flexibility and memory capacity
3. **Motor Control**: Assess rhythm consistency and motor stability
4. **Overall Profile**: Synthesize findings into a supportive summary

Guidelines:
- Use supportive, non-judgmental language
- Highlight both strengths and areas for growth
- Keep it concise (3-4 paragraphs)
- Format in clean HTML with proper headings (<h4>) and paragraphs (<p>)
- DO NOT provide medical diagnosis or treatment recommendations
- Use a warm, encouraging tone

Return ONLY the HTML content, no markdown code blocks."""

        if not client:
            raise Exception("Gemini client not initialized")

        model_name = select_model_name(client)

        # Generate analysis using google-genai
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                top_p=0.95,
                top_k=40,
                max_output_tokens=1024,
            )
        )
        
        # Extract and clean response
        analysis = response.text.strip()
        
        # Remove markdown code block markers if present
        if analysis.startswith("```html"):
            analysis = analysis[7:]
        if analysis.startswith("```"):
            analysis = analysis[3:]
        if analysis.endswith("```"):
            analysis = analysis[:-3]
        
        return analysis.strip()
    
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return f"<p><strong>⚠️ AI Analysis Error</strong></p><p>Unable to generate analysis: {str(e)}</p>"


def select_model_name(client: genai.Client) -> str:
    """Select an available model that supports generateContent, preferring flash."""
    preferred = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-latest",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
    ]

    try:
        model_list = client.models.list()
        models = getattr(model_list, "models", model_list)

        available = []
        for model in models:
            name = getattr(model, "name", None) or getattr(model, "model", None) or str(model)
            if not name:
                continue
            supported = getattr(model, "supported_actions", None) or getattr(model, "supported_methods", None)
            if supported and "generateContent" not in supported:
                continue
            available.append(name)

        for pref in preferred:
            for name in available:
                if pref in name:
                    return name

        if available:
            return available[0]
    except Exception:
        pass

    return "gemini-2.5-flash"

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ADHD Assessment API",
        "gemini_configured": bool(GEMINI_API_KEY)
    }
