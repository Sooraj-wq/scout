import json
from typing import List

from fastapi import APIRouter, HTTPException
from google import genai
from pydantic import BaseModel

router = APIRouter()

# Fallback questions when Gemini is unavailable
FALLBACK_QUESTIONS = [
    {
        "id": 1,
        "question": "Is cerebral palsy considered a physical disability?",
        "correct": "yes",
        "type": "physical",
    },
    {
        "id": 2,
        "question": "Is deafness a type of sensory disability?",
        "correct": "yes",
        "type": "sensory",
    },
    {
        "id": 3,
        "question": "Is dyslexia a cognitive disability?",
        "correct": "yes",
        "type": "cognitive",
    },
    {
        "id": 4,
        "question": "Is schizophrenia a mental health disability?",
        "correct": "yes",
        "type": "mental",
    },
    {
        "id": 5,
        "question": "Can people with physical disabilities participate in sports?",
        "correct": "yes",
        "type": "general",
    },
    {
        "id": 6,
        "question": "Are all disabilities visible?",
        "correct": "no",
        "type": "general",
    },
    {
        "id": 7,
        "question": "Is ADHD considered a learning disability?",
        "correct": "no",
        "type": "general",
    },
    {
        "id": 8,
        "question": "Do assistive technologies help people with disabilities?",
        "correct": "yes",
        "type": "general",
    },
    {
        "id": 9,
        "question": "Is multiple sclerosis a progressive neurological disability?",
        "correct": "yes",
        "type": "general",
    },
    {
        "id": 10,
        "question": "Are disabilities always present from birth?",
        "correct": "no",
        "type": "general",
    },
]

# Initialize Gemini
try:
    client = genai.Client()
    GEMINI_AVAILABLE = True
except Exception as e:
    print(f"Gemini initialization failed: {e}")
    GEMINI_AVAILABLE = False
    client = None


class Answer(BaseModel):
    id: int
    answer: str  # "yes", "no", "dontknow"


class SubmitRequest(BaseModel):
    answers: List[Answer]


async def generate_questions_with_gemini():
    """Generate quiz questions using Gemini API"""
    if not client:
        return None

    try:
        prompt = """Generate 10 yes/no questions about various types of disabilities (physical, sensory, cognitive, mental health, learning disabilities, etc.) to test knowledge and promote awareness.

For each question, provide:
1. The question text (must be answerable with yes/no/don't know)
2. The correct answer (either "yes" or "no")
3. A category/type

Return ONLY a valid JSON array with this exact structure, no additional text:
[
  {
    "question": "Question text here?",
    "correct": "yes",
    "type": "category"
  }
]

Make questions educational and promote understanding of disabilities. Include a mix of yes and no answers."""

        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash", contents=prompt
        )

        # Extract JSON from response
        if not response or not response.text:
            return None

        response_text = response.text.strip()

        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()

        questions = json.loads(response_text)

        # Add IDs and validate
        for idx, q in enumerate(questions, 1):
            q["id"] = idx
            if "correct" not in q or "question" not in q:
                raise ValueError("Invalid question format")

        return questions[:10]  # Ensure max 10 questions

    except Exception as e:
        print(f"Gemini question generation failed: {e}")
        return None


@router.get("/questions")
async def get_questions():
    """Get quiz questions - tries Gemini first, falls back to static questions"""

    if GEMINI_AVAILABLE:
        gemini_questions = await generate_questions_with_gemini()
        if gemini_questions:
            # Store questions for scoring (in production, use database/cache)
            # Return questions without correct answers
            return [
                {"id": q["id"], "question": q["question"]} for q in gemini_questions
            ]

    # Fallback to static questions
    return [{"id": q["id"], "question": q["question"]} for q in FALLBACK_QUESTIONS]


@router.post("/submit")
async def submit_answers(request: SubmitRequest):
    """Submit quiz answers and get score - uses fallback questions for scoring"""
    score = 0
    total = len(FALLBACK_QUESTIONS)

    for ans in request.answers:
        q = next((q for q in FALLBACK_QUESTIONS if q["id"] == ans.id), None)
        if not q:
            raise HTTPException(
                status_code=400, detail=f"Invalid question id: {ans.id}"
            )
        if ans.answer == q["correct"]:
            score += 1

    return {"score": score, "total": total, "percentage": round(score / total * 100, 2)}
