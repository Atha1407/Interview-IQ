from google import genai

from app.core.config import settings
from app.schemas.ai_evaluation import AIEvaluationResponse


client = genai.Client(
    api_key=settings.gemini_api_key,
)


def evaluate_answer_with_ai(
    question: str,
    answer: str,
) -> AIEvaluationResponse:
    """
    Evaluates an interview answer using Gemini.
    """

    prompt = f"""
You are an expert technical interviewer.

Evaluate the candidate's answer objectively.

Interview Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer using these four criteria:

1. Technical accuracy
2. Relevance
3. Completeness
4. Communication

Give each criterion a score from 0 to 10.

Also provide:
- Strengths
- Weaknesses
- Specific feedback for improvement
"""

    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=prompt,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": AIEvaluationResponse.model_json_schema(),
        },
    )

    return AIEvaluationResponse.model_validate_json(
        interaction.output_text
    )