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


class ExplanationResult(BaseModel):
    explanation: str
