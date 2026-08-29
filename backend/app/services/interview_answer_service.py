from uuid import UUID

from sqlalchemy.orm import Session

from app.models.interview_answer import InterviewAnswer
from app.models.interview_question import InterviewQuestion


def submit_answer(
    db: Session,
    question_id: UUID,
    answer_text: str,
) -> InterviewAnswer:

    answer = InterviewAnswer(
        question_id=question_id,
        answer_text=answer_text,
    )

    db.add(answer)
    db.commit()
    db.refresh(answer)

    return answer