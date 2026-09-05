import logging
from pydantic import BaseModel, Field
from google import genai
from app.core.config import settings
from app.models.interview_session import InterviewSession

logger = logging.getLogger(__name__)

client = genai.Client(
    api_key=settings.gemini_api_key,
)

class GeneratedQuestion(BaseModel):
    question_text: str = Field(description="The exact text of the interview question.")
    topic: str = Field(description="The specific topic the question covers, selected from the provided topics list.")

class GeneratedQuestionsResponse(BaseModel):
    questions: list[GeneratedQuestion] = Field(description="The list of generated questions.")

STOP_WORDS = {
    "a", "an", "the", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "can", "could", "should",
    "would", "will", "shall", "what", "which", "who", "whom", "this",
    "that", "these", "those", "how", "why", "when", "where", "explain",
    "describe", "difference", "between", "concept", "you", "your", "give",
}

def is_duplicate(q1: str, q2: str) -> bool:
    """Check if two questions are genuinely duplicate by comparing meaningful content words."""
    w1 = {w.strip("?,.:;!") for w in q1.lower().split() if w.strip("?,.:;!") not in STOP_WORDS and len(w) > 2}
    w2 = {w.strip("?,.:;!") for w in q2.lower().split() if w.strip("?,.:;!") not in STOP_WORDS and len(w) > 2}
    if not w1 or not w2:
        return False
    intersection = len(w1.intersection(w2))
    union = len(w1.union(w2))
    return (intersection / union) > 0.8

from sqlalchemy.orm import Session
from app.models.interview_question import InterviewQuestion

def generate_questions(session: InterviewSession) -> list[dict]:
    db = Session.object_session(session)
    previous_questions = []
    
    if db:
        try:
            prev_qs = (
                db.query(InterviewQuestion.question_text)
                .join(InterviewSession, InterviewQuestion.session_id == InterviewSession.id)
                .filter(
                    InterviewSession.user_id == session.user_id,
                    InterviewSession.difficulty == session.difficulty,
                    InterviewSession.interview_type == session.interview_type,
                    InterviewQuestion.session_id != session.id
                )
                .order_by(InterviewQuestion.id.desc())
                .limit(15)
                .all()
            )
            previous_questions = [q[0] for q in prev_qs]
        except Exception as e:
            logger.warning(f"Could not fetch previous questions: {e}")

    avoid_questions_text = ""
    if previous_questions:
        avoid_questions_text = (
            "IMPORTANT: Do NOT repeat or closely paraphrase any of the following questions "
            "that the candidate has already been asked in previous interviews:\n" +
            "\n".join([f"- {q}" for q in previous_questions]) + "\n\n"
        )

    prompt = f"""
You are an expert technical interviewer conducting a {session.interview_type} interview.

Please generate {session.question_count} unique interview questions based on the following topics:
{", ".join(session.topics)}

The difficulty level of the questions should be: {session.difficulty}.

{avoid_questions_text}Requirements:
- Generate EXACTLY {session.question_count} questions.
- Each question must be completely distinct and test a different concept. DO NOT generate duplicate or nearly identical questions.
- Vary the questions by covering different concepts, scenarios, subtopics, and question styles.
- For example, if the topic is React.js, do not repeatedly ask generic questions like "What are React hooks?". Instead vary between hooks, state management, rendering, performance, component architecture, props, lifecycle behavior, forms, error handling, etc., depending on difficulty.
- If multiple questions share the same topic, they MUST cover completely different sub-topics.
- Ensure the questions align with the specified difficulty level.
- Return the exact topic (from the list above) that each question addresses.
"""

    max_retries = 2
    
    for attempt in range(max_retries):
        try:
            interaction = client.interactions.create(
                model="gemini-3.5-flash-lite",
                input=prompt,
                response_format={
                    "type": "text",
                    "mime_type": "application/json",
                    "schema": GeneratedQuestionsResponse.model_json_schema(),
                },
            )
            
            result = GeneratedQuestionsResponse.model_validate_json(interaction.output_text)
            
            # Truncate if model generated too many
            generated = result.questions[:session.question_count]
            
            # Check for duplicates within the generated list
            has_duplicates = False
            for i in range(len(generated)):
                for j in range(i + 1, len(generated)):
                    if is_duplicate(generated[i].question_text, generated[j].question_text):
                        has_duplicates = True
                        break
                if has_duplicates:
                    break
            
            if has_duplicates and attempt < max_retries - 1:
                logger.warning(f"Duplicate questions detected on attempt {attempt + 1}. Retrying...")
                continue
            
            # If we reached here without breaking for retry (or it's the last attempt), accept it
            # Pad with fallback if not enough questions were generated
            while len(generated) < session.question_count:
                fallback_topic = session.topics[len(generated) % len(session.topics)]
                generated.append(GeneratedQuestion(
                    question_text=f"Can you explain a concept related to {fallback_topic}?",
                    topic=fallback_topic
                ))

            # Format response
            formatted_questions = []
            for i, q in enumerate(generated):
                formatted_questions.append({
                    "question_text": q.question_text,
                    "difficulty": session.difficulty,
                    "topic": q.topic,
                    "question_order": i + 1,
                })
                
            return formatted_questions

        except Exception as e:
            logger.error(f"Error generating questions (attempt {attempt + 1}): {e}")
            if attempt == max_retries - 1:
                raise

    # Fallback if all else fails
    fallback_questions = []
    for i in range(session.question_count):
        topic = session.topics[i % len(session.topics)]
        fallback_questions.append({
            "question_text": f"Explain an important concept related to {topic}.",
            "difficulty": session.difficulty,
            "topic": topic,
            "question_order": i + 1,
        })
    return fallback_questions