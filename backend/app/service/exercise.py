from uuid import uuid4

from sqlalchemy import insert, or_, select, func
from sqlalchemy.orm import Session

from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate


def bulk_create_exercises(
    db: Session,
    exercises: list[ExerciseCreate],
) -> list[Exercise]:
    
    existing_stmt = (
        select(func.lower(Exercise.name))
        .where(
            Exercise.created_by.is_(None),
            Exercise.is_deleted.is_(False)
        )
    )
    
    existing_names = set(
        db.execute(existing_stmt).scalars().all()
    )
    
    seen_names = set()
    
    rows = []
    for exercise in exercises:
        
        normalized_name = exercise.name.lower()
        
        if normalized_name in existing_names:
            continue
        if normalized_name in seen_names:
            continue
        
        seen_names.add(normalized_name)
        
        rows.append({
            "id": str(uuid4()),
            "name": exercise.name,
            "description": exercise.description,
            "primary_muscle": exercise.primary_muscle,
            "equipment": exercise.equipment,
            "tracking_type": exercise.tracking_type,
            "is_deleted": False,
            "created_by": None,
        })
        
    if not rows:
        return []

    stmt = insert(Exercise).returning(Exercise)

    result = db.execute(stmt, rows)

    db.commit()

    return list(result.scalars().all())


def get_exercises(
    db: Session,
    user_id: str,
    search: str | None = None,
    primary_muscle: str | None = None,
    limit: int = 20,
    offset: int = 0
) -> list[Exercise]:

    stmt = select(Exercise).where(
        Exercise.is_deleted.is_(False),
        or_(
            Exercise.created_by.is_(None),
            Exercise.created_by == user_id
        )
    )

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


def create_custom_exercise(
    db: Session,
    user_id: str,
    exercise_data: ExerciseCreate
) -> Exercise:
    
    new_exercise = Exercise(
        name=exercise_data.name,
        description=exercise_data.description,
        primary_muscle=exercise_data.primary_muscle,
        equipment=exercise_data.equipment,
        tracking_type=exercise_data.tracking_type,
        is_deleted=False,
        created_by=user_id
    )
    
    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)
    
    return new_exercise