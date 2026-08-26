from typing import TYPE_CHECKING

from sqlalchemy import Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.routine import RoutineExercise


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(Text)

    primary_muscle: Mapped[str | None] = mapped_column(Text)

    equipment: Mapped[str | None] = mapped_column(Text)

    created_by: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False)
    )

    routine_exercises: Mapped[list["RoutineExercise"]] = relationship(
        back_populates="exercise"
    )