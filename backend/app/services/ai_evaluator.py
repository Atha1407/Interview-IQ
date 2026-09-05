from google import genai

from app.core.config import settings
from app.schemas.ai_evaluation import (
    AIEvaluationResponse,
    BatchAIEvaluationResponse,
)


client = genai.Client(
    api_key=settings.gemini_api_key,
)


def evaluate_answer_with_ai(
    question: str,
    answer: str,
) -> AIEvaluationResponse:
    """
    Evaluates a single interview answer using Gemini.
    Kept for backward compatibility.
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
        model="gemini-3.5-flash-lite",
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


def evaluate_interview_with_ai(
    questions_and_answers: list[dict],
) -> BatchAIEvaluationResponse:
    """
    Evaluates all interview answers using a single Gemini request.
    """

    interview_content = "\n\n".join(
        [
            f"""
Answer ID: {item["answer_id"]}

Interview Question:
{item["question"]}

Candidate Answer:
{item["answer"]}
"""
            for item in questions_and_answers
        ]
    )

    prompt = f"""
You are an expert technical interviewer.

Evaluate ALL candidate answers from this interview.

You must evaluate every answer independently.

{interview_content}

For EACH answer, evaluate these four criteria:

1. Technical accuracy
2. Relevance
3. Completeness
4. Communication

Give each criterion a score from 0 to 10.

Also provide for EACH answer:
- Strengths
- Weaknesses
- Specific feedback for improvement

IMPORTANT RULES:

1. Return exactly one evaluation for every Answer ID provided.
2. Do not skip any answer.
3. Do not create or modify Answer IDs.
4. Evaluate each answer independently.
5. Return valid JSON matching the required response schema.
"""

    interaction = client.interactions.create(
        model="gemini-3.5-flash-lite",
        input=prompt,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": BatchAIEvaluationResponse.model_json_schema(),
        },
    )

    return BatchAIEvaluationResponse.model_validate_json(
        interaction.output_text
    )