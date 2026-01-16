from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from .models import TaskAttempt, SessionData, AnalysisResult, ExplanationResult
from .storage import get_session, get_or_create_session
from .analysis import analyze_patterns, calculate_overall_score
from .explanation import generate_explanation_text
from .ai_services import (
    get_ai_analysis,
    calculate_flash_duration,
    AIAnalysisRequest,
    FlashDurationRequest,
    FlashDurationResponse,
    AIAnalysisResponse,
)

router = APIRouter(prefix="/api/dyscalculia", tags=["dyscalculia"])


@router.post("/sessions/{session_id}/attempts")
async def add_attempt(session_id: str, attempt: TaskAttempt):
    """Log a task attempt for a session."""
    session = get_or_create_session(session_id)
    session.attempts.append(attempt)
    return {"status": "success"}


@router.post("/sessions/{session_id}/exposures")
async def add_exposure(session_id: str, exposure: Dict[str, Any]):
    """Log an exposure event for a session."""
    session = get_or_create_session(session_id)
    session.exposures.append(exposure)
    return {"status": "success"}


@router.post("/sessions/{session_id}/stress-indicators")
async def add_stress_indicator(session_id: str, indicator: Dict[str, Any]):
    """Log a stress indicator for a session."""
    session = get_or_create_session(session_id)
    session.stress_indicators.append(indicator)
    return {"status": "success"}


@router.get("/sessions/{session_id}")
async def get_session_data(session_id: str) -> SessionData:
    """Get all data for a session."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/sessions/{session_id}/analyze")
async def analyze_session(session_id: str) -> AnalysisResult:
    """Analyze patterns in a session's data."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    analysis = analyze_patterns(session.attempts)
    return analysis


@router.post("/sessions/{session_id}/explanation")
async def generate_explanation(session_id: str) -> ExplanationResult:
    """Generate human-readable explanation for a session."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    analysis = analyze_patterns(session.attempts)
    explanation = generate_explanation_text(analysis, session.exposures)

    return ExplanationResult(explanation=explanation)


@router.get("/sessions/{session_id}/score")
async def get_session_score(session_id: str) -> Dict[str, Any]:
    """Get the overall score for a session."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    score = calculate_overall_score(session.attempts)
    analysis = analyze_patterns(session.attempts)

    return {
        "session_id": session_id,
        "score": score,
        "pattern": analysis.pattern,
        "confidence": analysis.confidence,
        "sub_scores": analysis.sub_scores,
    }


@router.post("/ai-analysis", response_model=AIAnalysisResponse)
async def get_ai_analysis_endpoint(request: AIAnalysisRequest):
    """
    Get AI-powered analysis for a session using Groq or Google AI Studio
    All API calls are made from backend, not frontend
    """
    session = get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Convert SessionData to dict for analysis
    session_dict = {
        "session_id": session.session_id,
        "attempts": [
            attempt.dict() if hasattr(attempt, "dict") else attempt
            for attempt in session.attempts
        ],
        "exposures": session.exposures,
        "stress_indicators": session.stress_indicators,
    }

    try:
        analysis = await get_ai_analysis(session_dict)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/flash-duration", response_model=FlashDurationResponse)
async def get_flash_duration_endpoint(request: FlashDurationRequest):
    """
    Calculate adaptive flash duration based on session performance
    Decreases duration for exemplary performance (>70%), increases for struggling (<70%)
    """
    session = get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Convert SessionData to dict for analysis
    session_dict = {
        "session_id": session.session_id,
        "attempts": [
            attempt.dict() if hasattr(attempt, "dict") else attempt
            for attempt in session.attempts
        ],
        "exposures": session.exposures,
        "stress_indicators": session.stress_indicators,
    }

    duration_info = calculate_flash_duration(session_dict, request.difficulty)
    return duration_info
