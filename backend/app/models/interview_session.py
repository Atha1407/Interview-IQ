from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class InterviewType(str, Enum):
    TECHNICAL = "technical"
    HR = "hr"
    BEHAVIORAL = "behavioral"


class InterviewStatus(str, Enum):
    CREATED = "created"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    resume_id: Mapped[UUID] = mapped_column(
        ForeignKey("resumes.id"),
        nullable=False,
        index=True,
    )

    interview_type: Mapped[InterviewType] = mapped_column(
        SQLEnum(InterviewType),
        nullable=False,
    )

    status: Mapped[InterviewStatus] = mapped_column(
        SQLEnum(InterviewStatus),
        default=InterviewStatus.CREATED,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )