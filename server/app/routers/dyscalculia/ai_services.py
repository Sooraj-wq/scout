"""
AI Services Module - Handles all external API calls (Groq and Google AI Studio)
All API calls are made from the backend, not frontend
"""

import os
import json
import httpx
from typing import Dict, Any, Optional
from pydantic import BaseModel


class AIAnalysisRequest(BaseModel):
    session_id: str


class FlashDurationRequest(BaseModel):
    session_id: str
    difficulty: int


class FlashDurationResponse(BaseModel):
    duration_ms: int
    base_duration_ms: int
    performance_percentage: Optional[float]
    adjustment_reason: str


class AIAnalysisResponse(BaseModel):
    pattern: str
    confidence: float
    score: int
    sub_scores: Dict[str, float]
    reasoning: str
    interpretation: str


class AIServiceConfig:
    """Configuration for AI services - reads from environment dynamically"""

    @staticmethod
    def get_groq_endpoint():
        return os.getenv(
            "GROQ_ENDPOINT", "https://api.groq.com/openai/v1/chat/completions"
        )

    @staticmethod
    def get_groq_api_key():
        return os.getenv("GROQ_API_KEY")

    @staticmethod
    def get_groq_model():
        return os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

    @staticmethod
    def get_google_endpoint():
        return os.getenv(
            "GOOGLE_ENDPOINT",
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        )

    @staticmethod
    def get_google_api_key():
        return os.getenv("GOOGLE_API_KEY")

    @staticmethod
    def get_api_timeout():
        return 5.0


def format_analysis_prompt(session_data: Dict[str, Any]) -> str:
    """Format session data for AI analysis prompt"""
    attempts = session_data.get("attempts", [])
    summary = {
        "total_attempts": len(attempts),
        "correct": sum(1 for a in attempts if a.get("correct")),
        "incorrect": sum(1 for a in attempts if not a.get("correct")),
        "avg_latency": sum(a.get("latency", 0) for a in attempts) / len(attempts)
        if attempts
        else 0,
    }

    by_task_type = {}
    for attempt in attempts:
        task_type = attempt.get("task_type", "unknown")
        if task_type not in by_task_type:
            by_task_type[task_type] = {"correct": 0, "total": 0}
        by_task_type[task_type]["total"] += 1
        if attempt.get("correct"):
            by_task_type[task_type]["correct"] += 1

    prompt = f"""Analyze this dyscalculia assessment session data and provide a structured analysis:

SESSION SUMMARY:
- Total attempts: {summary["total_attempts"]}
- Correct answers: {summary["correct"]}
- Incorrect answers: {summary["incorrect"]}
- Average response time: {round(summary["avg_latency"])}ms

TASK PERFORMANCE:
"""
    for task_type, data in by_task_type.items():
        percentage = round((data["correct"] / data["total"]) * 100)
        prompt += f"- {task_type}: {data['correct']}/{data['total']} correct ({percentage}%)\n"

    prompt += f"""
RAW DATA:
{json.dumps(session_data, indent=2)}

Based on this data, provide an analysis in the following JSON format:
{{
  "pattern": "exposure_related" | "possible_dyscalculia_signal" | "unclear",
  "confidence": 0.0-1.0,
  "score": 0-100,
  "sub_scores": {{
    "quantity": 0-100,
    "comparison": 0-100,
    "symbol": 0-100,
    "flash_counting": 0-100
  }},
  "reasoning": "brief explanation of the analysis",
  "interpretation": "user-friendly interpretation"
}}

Return ONLY the JSON object, no additional text."""

    return prompt


async def call_groq_api(prompt: str) -> Dict[str, Any]:
    """Call Groq API with timeout"""
    api_key = AIServiceConfig.get_groq_api_key()
    if not api_key:
        raise Exception("Groq API key not configured")

    async with httpx.AsyncClient(timeout=AIServiceConfig.get_api_timeout()) as client:
        try:
            response = await client.post(
                AIServiceConfig.get_groq_endpoint(),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                json={
                    "model": AIServiceConfig.get_groq_model(),
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert educational psychologist analyzing learning assessment data. Always respond with valid JSON only.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1000,
                },
            )
            response.raise_for_status()
            result = response.json()

            content = result.get("choices", [{}])[0].get("message", {}).get("content")
            if not content:
                raise Exception("Invalid Groq response structure")

            return json.loads(content.strip())

        except httpx.TimeoutException:
            raise Exception("Groq API timeout after 5 seconds")
        except httpx.HTTPStatusError as e:
            raise Exception(
                f"Groq API failed: {e.response.status_code} - {e.response.text}"
            )
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON in Groq response: {str(e)}")


async def call_google_ai_api(prompt: str) -> Dict[str, Any]:
    """Call Google AI Studio API with timeout"""
    api_key = AIServiceConfig.get_google_api_key()
    if not api_key:
        raise Exception("Google AI API key not configured")

    url = AIServiceConfig.get_google_endpoint()

    async with httpx.AsyncClient(timeout=AIServiceConfig.get_api_timeout()) as client:
        try:
            response = await client.post(
                url,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key,
                },
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1000},
                },
            )
            response.raise_for_status()
            result = response.json()

            content = (
                result.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text")
            )
            if not content:
                raise Exception("Invalid Google AI response structure")

            return json.loads(content.strip())

        except httpx.TimeoutException:
            raise Exception("Google AI API timeout after 5 seconds")
        except httpx.HTTPStatusError as e:
            raise Exception(
                f"Google AI API failed: {e.response.status_code} - {e.response.text}"
            )
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON in Google AI response: {str(e)}")


async def get_ai_analysis(session_data: Dict[str, Any]) -> AIAnalysisResponse:
    """
    Get AI analysis from session data
    Tries Groq first, falls back to Google AI Studio
    """
    prompt = format_analysis_prompt(session_data)

    # Try Groq first
    groq_key = AIServiceConfig.get_groq_api_key()
    if groq_key:
        try:
            print("Attempting Groq API call...")
            result = await call_groq_api(prompt)
            print("Groq API call successful")
            return AIAnalysisResponse(**result)
        except Exception as e:
            print(f"Groq API failed: {str(e)}")
    else:
        print("Groq not configured, skipping to Google AI")

    # Fallback to Google AI Studio
    google_key = AIServiceConfig.get_google_api_key()
    if google_key:
        try:
            print("Attempting Google AI API call...")
            result = await call_google_ai_api(prompt)
            print("Google AI API call successful")
            return AIAnalysisResponse(**result)
        except Exception as e:
            print(f"Google AI API failed: {str(e)}")
    else:
        print("Google AI not configured")

    # If both fail
    raise Exception("All AI API calls failed. Please check API key configuration.")


def calculate_flash_duration(
    session_data: Dict[str, Any], difficulty: int
) -> FlashDurationResponse:
    """
    Calculate adaptive flash duration based on performance and difficulty
    Decrease by 0.2s per 10% above 70% (exemplary performance)
    Increase by 0.2s per 10% below 70% (struggling)
    """
    attempts = session_data.get("attempts", [])

    # Filter flash counting attempts only
    flash_attempts = [a for a in attempts if a.get("task_type") == "flash_counting"]

    # Determine base duration based on difficulty
    if difficulty <= 2:
        base_duration = 3000
    elif difficulty <= 4:
        base_duration = 2500
    elif difficulty <= 6:
        base_duration = 2000
    else:
        base_duration = 1500

    duration = base_duration
    performance_percentage = None
    adjustment_reason = "Base duration for difficulty level"

    # Calculate performance if we have flash attempts
    if flash_attempts:
        correct_count = sum(1 for a in flash_attempts if a.get("correct"))
        total_count = len(flash_attempts)
        performance_percentage = round((correct_count / total_count) * 100, 1)

        # Adjust duration based on performance
        if performance_percentage > 70:
            # Exemplary performance: decrease duration
            increment = int((performance_percentage - 70) // 10)
            duration = base_duration - (increment * 200)  # -0.2s = -200ms per 10%
            adjustment_reason = f"Exemplary performance ({performance_percentage}%): Decreased by {increment * 0.2}s"
        elif performance_percentage < 70:
            # Struggling: increase duration
            decrement = int((70 - performance_percentage) // 10)
            duration = base_duration + (decrement * 200)  # +0.2s = +200ms per 10%
            adjustment_reason = f"Below target ({performance_percentage}%): Increased by {decrement * 0.2}s"
        else:
            adjustment_reason = "At target performance (70%)"

        # Ensure reasonable bounds
        duration = max(1000, min(5000, duration))

    return FlashDurationResponse(
        duration_ms=duration,
        base_duration_ms=base_duration,
        performance_percentage=performance_percentage,
        adjustment_reason=adjustment_reason,
    )
