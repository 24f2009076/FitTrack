from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import uuid


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"
    
    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        nullable=False
    )

    routine_day_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("routine_days.id"),
        nullable=False
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="in_progress"
    )

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )
    
    session_exercises: Mapped[list["WorkoutSessionExercise"]] = relationship(
        "WorkoutSessionExercise",
        back_populates="workout_session",
        cascade="all, delete-orphan"
    )
    
# class WorkoutExercise(Base):
#     __tablename__ = "workout_exercises"

#     id: Mapped[str] = mapped_column(
#         UUID(as_uuid=False),
#         primary_key=True
#     )

#     workout_session_id: Mapped[str] = mapped_column(
#         UUID(as_uuid=False),
#         ForeignKey("workout_sessions.id"),
#         nullable=False
#     )

#     exercise_id: Mapped[str] = mapped_column(
#         UUID(as_uuid=False),
#         ForeignKey("exercises.id"),
#         nullable=False
#     )

#     exercise_order: Mapped[int] = mapped_column(
#         Integer,
#         nullable=False
#     )

#     exercise_name: Mapped[str] = mapped_column(
#         Text,
#         nullable=False
#     )

#     tracking_type: Mapped[str] = mapped_column(
#         Text,
#         nullable=False
#     )
    
#     workout_session: Mapped["WorkoutSession"] = relationship(
#         "WorkoutSession",
#         back_populates="workout_exercises"
#     )

#     exercise: Mapped["Exercise"] = relationship(
#         "Exercise"
#     )

#     sets: Mapped[list["WorkoutSet"]] = relationship(
#         "WorkoutSet",
#         back_populates="workout_exercise"
#     )
     
class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    workout_session_exercise_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey(
            "workout_session_exercises.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    set_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    reps: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    weight_kg: Mapped[float | None] = mapped_column(
        Numeric,
        nullable=True
    )

    duration_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )
    
    session_exercise = relationship(
        "WorkoutSessionExercise",
        back_populates="sets"
    )
    
class WorkoutSessionExercise(Base):
    __tablename__ = "workout_session_exercises"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    workout_session_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("workout_sessions.id", ondelete="CASCADE"),
        nullable=False
    )

    exercise_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("exercises.id", ondelete="SET NULL"),
        nullable=True
    )

    exercise_name: Mapped[str] = mapped_column(nullable=False)
    tracking_type: Mapped[str] = mapped_column(nullable=False)

    exercise_order: Mapped[int] = mapped_column(nullable=False)

    planned_sets: Mapped[int | None] = mapped_column(nullable=True)
    planned_reps: Mapped[int | None] = mapped_column(nullable=True)
    planned_duration_seconds: Mapped[int | None] = mapped_column(nullable=True)

    status: Mapped[str] = mapped_column(
        nullable=False,
        default="upcoming"
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    
    workout_session: Mapped["WorkoutSession"] = relationship(
        "WorkoutSession",
        back_populates="session_exercises"
    )
    
    exercise = relationship(
        "Exercise"
    )
    
    sets = relationship(
        "WorkoutSet",
        back_populates="session_exercise",
        cascade="all, delete-orphan"
    )
    
    
    
    
    
    