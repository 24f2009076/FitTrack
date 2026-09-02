from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from backend.app.models.exercise import Exercise



class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True
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
    
    workout_exercises: Mapped[list["WorkoutExercise"]] = relationship(
        "WorkoutExercise",
        back_populates="workout_session"
    )
    
class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True
    )

    workout_session_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("workout_sessions.id"),
        nullable=False
    )

    exercise_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("exercises.id"),
        nullable=False
    )

    exercise_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    exercise_name: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    tracking_type: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    
    workout_session: Mapped["WorkoutSession"] = relationship(
        "WorkoutSession",
        back_populates="workout_exercises"
    )

    exercise: Mapped["Exercise"] = relationship(
        "Exercise"
    )

    sets: Mapped[list["WorkoutSet"]] = relationship(
        "WorkoutSet",
        back_populates="workout_exercise"
    )
    
    
    
class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True
    )

    workout_exercise_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("workout_exercises.id"),
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
    
    workout_exercise: Mapped["WorkoutExercise"] = relationship(
        "WorkoutExercise",
        back_populates="sets"
    )