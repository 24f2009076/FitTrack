from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.exercise import (
    ExerciseBulkCreate,
    ExerciseResponse,
)
from app.service.exercise import bulk_create_exercises, get_exercises


router = APIRouter(
    prefix="/exercises",
    tags=["Exercises"],
)


@router.post(
    "/bulk",
    response_model=list[ExerciseResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_exercises_bulk(
    payload: ExerciseBulkCreate,
    db: Session = Depends(get_db),
):
    return bulk_create_exercises(
        db=db,
        exercises=payload.exercises,
    )
    
@router.get(
    "",
    response_model=list[ExerciseResponse],
)
def list_exercises(
    search : str | None = Query(
        default=None,
        description="Search exercises by name"
    ),
    primary_muscle: str | None = Query(
        default=None,
        description="Filter exercises by primary muscle"
    ),
    limit: int = Query(
        default=20,
        ge = 1,
        le = 100
    ),
    offset: int = Query(
        default=0,
        ge=0
    ),
    db : Session = Depends(get_db)
):

    return get_exercises(
        db=db,
        search=search,
        primary_muscle=primary_muscle,
        limit=limit,
        offset=offset
    )