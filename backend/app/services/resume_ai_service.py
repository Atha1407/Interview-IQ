from google import genai

from app.core.config import settings
from app.schemas.resume_ai import ResumeTopicsResponse


client = genai.Client(
    api_key=settings.gemini_api_key,
)


def extract_resume_topics(resume_text: str) -> list[str]:
    """
    Extract relevant interview topics from resume text using Gemini.
    """

    prompt = f"""
You are an expert technical interviewer.

Analyze the candidate's resume below and identify the most important
technical topics that could be discussed in an interview.

Resume:
{resume_text}

Focus on:
- Programming languages
- Frameworks and libraries
- Databases
- Tools and technologies
- Computer science concepts
- Projects and technical areas
- Cloud and infrastructure
- Other relevant technical skills

Do not include:
- Candidate name
- Email
- Phone number
- College or school names
- Generic topics
- Duplicate topics

Return between 5 and 15 relevant topics.
"""

    interaction = client.interactions.create(
        model="gemini-3.5-flash-lite",
        input=prompt,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": ResumeTopicsResponse.model_json_schema(),
        },
    )

    result = ResumeTopicsResponse.model_validate_json(
        interaction.output_text
    )

    return result.topics
