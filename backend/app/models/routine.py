from sqlalchemy import Boolean, ForeignKey, Integer, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.exercise import Exercise
from app.database import Base


class Routine(Base):
    __tablename__ = "routines"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("profiles.id"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )
    
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )
    
    days: Mapped[list["RoutineDay"]] = relationship(
        "RoutineDay",
        back_populates="routine",
        order_by="RoutineDay.day_of_week"
    )



class RoutineDay(Base):
    __tablename__ = "routine_days"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    routine_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("routines.id"),
        nullable=False
    )

    day_of_week: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    name: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    is_rest_day: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )
    
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )
    
    routine: Mapped["Routine"] = relationship(
        "Routine",
        back_populates="days"
    )
    
    exercises: Mapped[list["RoutineExercise"]] = relationship(
        "RoutineExercise",
        back_populates="routine_day",
        order_by="RoutineExercise.exercise_order"
    )


class RoutineExercise(Base):
    __tablename__ = "routine_exercises"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    routine_day_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("routine_days.id"),
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

    planned_sets: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    planned_reps: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    planned_duration_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )
    
    
    routine_day: Mapped["RoutineDay"] = relationship(
        "RoutineDay",
        back_populates="exercises"
    )
    
    exercise: Mapped["Exercise"] = relationship(
        "Exercise",
        back_populates="routine_exercises"
    )

    @property
    def reps(self) -> int | None:
        if self.planned_reps is not None:
            return self.planned_reps
        return None

    @reps.setter
    def reps(self, value: int | None) -> None:
        self.rep_min = value
        self.rep_max = value