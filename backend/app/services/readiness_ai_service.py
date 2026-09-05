from google import genai

from app.core.config import settings
from app.schemas.readiness import PersonalizedActionPlan


client = genai.Client(
    api_key=settings.gemini_api_key,
)


def generate_personalized_action_plan(
    readiness_gaps: list[dict],
    evaluations: list[dict],
) -> list[str]:
    """
    Generates a personalized interview improvement plan
    using the candidate's actual evaluation data.
    """

    if not readiness_gaps:
        return []

    prompt = f"""
You are an expert technical interview coach.

Analyze the candidate's actual interview performance and
create a personalized improvement action plan.

READINESS GAPS:
{readiness_gaps}

ANSWER EVALUATIONS:
{evaluations}

Instructions:

1. Focus only on the candidate's actual weaknesses.
2. Identify recurring patterns across the answers.
3. Do not give generic motivational advice.
4. Give 3 to 6 specific and practical actions.
5. Each action should tell the candidate what to practice
   or what behavior to change.
6. Avoid repeating the same recommendation.
7. Keep each action concise and easy to understand.
8. Tailor the recommendations to the evidence provided.
"""

    interaction = client.interactions.create(
        model="gemini-3.5-flash-lite",
        input=prompt,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": PersonalizedActionPlan.model_json_schema(),
        },
    )

    result = PersonalizedActionPlan.model_validate_json(
        interaction.output_text
    )

    return result.action_plan
