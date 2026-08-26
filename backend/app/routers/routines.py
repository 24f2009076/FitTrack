from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user
from app.database import get_db
from app.models.routine import Routine, RoutineDay, RoutineExercise
from app.schemas.routine import RoutineResponse
from app.schemas.routine import RoutineCreate, RoutineResponse


router = APIRouter(
    prefix="/api/routines",
    tags=["routines"],
)


@router.get("", response_model=list[RoutineResponse])
def get_routines(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    routines = db.query(Routine).options(
        joinedload(Routine.days)
        .joinedload(RoutineDay.exercises)
        .joinedload(RoutineExercise.exercise)
        ).filter(
            Routine.user_id == str(current_user.id)
        ).all()
        
    return routines


@router.post("", response_model=RoutineResponse)
def create_routine(
    data: RoutineCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        routine = Routine(
            user_id=str(current_user.id),
            name=data.name,
            description=data.description,
            is_active=True
        )

        db.add(routine)
        db.flush()

        for day_data in data.days:

            routine_day = RoutineDay(
                routine_id=routine.id,
                day_of_week=day_data.day_of_week,
                name=day_data.name,
                is_rest_day=day_data.is_rest_day
            )

            db.add(routine_day)
            db.flush()

            if not day_data.is_rest_day:
                for exercise_data in day_data.exercises:

                    routine_exercise = RoutineExercise(
                        routine_day_id=routine_day.id,
                        exercise_id=exercise_data.exercise_id,
                        exercise_order=exercise_data.exercise_order,
                        sets=exercise_data.sets,
                        reps=exercise_data.reps,
                        notes=exercise_data.notes
                    )

                    db.add(routine_exercise)

        db.commit()
        db.refresh(routine)

        return routine

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    