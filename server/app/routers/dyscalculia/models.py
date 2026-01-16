from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class TaskAttempt(BaseModel):
    task_type: str
    correct: bool
    selected_answer: Any
    correct_answer: Any
    latency: float
    attempts: int
    timestamp: Optional[float] = None
    difficulty: Optional[int] = None
    # session_id is now taken from URL path


class SessionData(BaseModel):
    session_id: str
    attempts: List[TaskAttempt]
    exposures: List[Dict[str, Any]]
    stress_indicators: List[Dict[str, Any]]


class AnalysisResult(BaseModel):
    pattern: str
    confidence: float
    reasoning: str
    sub_scores: Dict[str, float]
    dbn_probability: Optional[float] = None
    dbn_confidence: Optional[float] = None
    dbn_features: Optional[Dict[str, float]] = None
    additional_tests_needed: Optional[int] = None


class ExplanationResult(BaseModel):
    explanation: str


class AIAnalysisRequest(BaseModel):
    session_id: str


class AIAnalysisResponse(BaseModel):
    pattern: str
    confidence: float
    score: int
    sub_scores: Dict[str, float]
    reasoning: str
    interpretation: str


class FlashDurationRequest(BaseModel):
    session_id: str
    difficulty: int


class FlashDurationResponse(BaseModel):
    duration_ms: int
    base_duration_ms: int
    performance_percentage: Optional[float]
    adjustment_reason: str
