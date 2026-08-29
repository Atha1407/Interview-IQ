from app.models.interview_session import InterviewSession


def generate_questions(
    session: InterviewSession,
) -> list[dict]:

    questions = []

    for index in range(1, session.question_count + 1):
        topic = session.topics[(index - 1) % len(session.topics)]

        questions.append(
            {
                "question_text": (
                    f"Explain an important concept related to {topic}."
                ),
                "difficulty": session.difficulty,
                "topic": topic,
                "question_order": index,
            }
        )

    return questions