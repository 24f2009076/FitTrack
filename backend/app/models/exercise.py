from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.routine import RoutineExercise


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    name: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    primary_muscle: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
    
    tracking_type: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    equipment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_by: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        nullable=True
    )
    
    is_deleted: Mapped[bool] = mapped_column(
        nullable=False,
        default=False
    )

    routine_exercises: Mapped[list["RoutineExercise"]] = relationship(
        back_populates="exercise"
    )