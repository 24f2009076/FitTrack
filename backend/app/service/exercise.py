from uuid import uuid4

from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate


def bulk_create_exercises(
    db: Session,
    exercises: list[ExerciseCreate],
) -> list[Exercise]:

    rows = [
        {
            "id": str(uuid4()),
            "name": exercise.name,
            "description": exercise.description,
            "primary_muscle": exercise.primary_muscle,
            "equipment": exercise.equipment,
            "created_by": None,
        }
        for exercise in exercises
    ]

    stmt = insert(Exercise).returning(Exercise)

    result = db.execute(stmt, rows)

    db.commit()

    return list(result.scalars().all())


def get_exercises(
    db: Session,
    search: str | None = None,
    primary_muscle: str | None = None,
    limit: int = 20,
    offset: int = 0
) -> list[Exercise]:

    stmt = select(Exercise)

    if search:
        stmt = stmt.where(
            Exercise.name.ilike(f"%{search}%")
        )

    if primary_muscle:
        stmt = stmt.where(
            Exercise.primary_muscle == primary_muscle
        )

    stmt = stmt.order_by(Exercise.name).limit(limit).offset(offset)

    result = db.execute(stmt)

    return list(result.scalars().all())