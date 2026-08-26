from sqlalchemy import Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.exercise import Exercise
from app.database import Base


class Routine(Base):
    __tablename__ = "routines"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True
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

    description: Mapped[str | None] = mapped_column(Text)

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )
    
    days: Mapped[list["RoutineDay"]] = relationship(
        back_populates="routine"
    )



class RoutineDay(Base):
    __tablename__ = "routine_days"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True
    )

    routine_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("routines.id"),
        nullable=False
    )

    day_of_week: Mapped[int] = mapped_column(
        nullable=False
    )

    name: Mapped[str | None] = mapped_column(Text)

    is_rest_day: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )
    
    routine: Mapped["Routine"] = relationship(
        back_populates="days"
    )
    
    exercises: Mapped[list["RoutineExercise"]] = relationship(
        back_populates="routine_day"
    )


class RoutineExercise(Base):
    __tablename__ = "routine_exercises"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True
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
        nullable=False
    )

    sets: Mapped[int | None] = mapped_column()

    rep_min: Mapped[int | None] = mapped_column()

    rep_max: Mapped[int | None] = mapped_column()

    notes: Mapped[str | None] = mapped_column(Text)
    
    routine_day: Mapped["RoutineDay"] = relationship(
        back_populates="exercises"
    )
    
    exercise: Mapped["Exercise"] = relationship(
        back_populates="routine_exercises"
    )

    @property
    def reps(self) -> int | None:
        if self.rep_min is not None:
            return self.rep_min
        return self.rep_max

    @reps.setter
    def reps(self, value: int | None) -> None:
        self.rep_min = value
        self.rep_max = value