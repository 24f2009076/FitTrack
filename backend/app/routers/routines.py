from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy import select, update
from sqlalchemy.orm import Session, joinedload, with_loader_criteria

from app.auth import get_current_user
from app.database import get_db
from app.models.routine import Routine, RoutineDay, RoutineExercise
from app.schemas.routine import RoutineCreate, RoutineResponse
from app.models.exercise import Exercise


router = APIRouter(
    prefix="/api/routines",
    tags=["routines"],
)


@router.get("", response_model=list[RoutineResponse])
def get_routines(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    
    routines = db.query(Routine).options(
        joinedload(Routine.days)
        .joinedload(RoutineDay.exercises)
        .joinedload(RoutineExercise.exercise),
        
        with_loader_criteria(
            RoutineDay,
            RoutineDay.is_deleted.is_(False),
            include_aliases=True
        )
        ).filter(
            Routine.user_id == str(current_user.id),
            Routine.is_deleted.is_(False)
        ).all()
        
    return routines


@router.post("", response_model=RoutineResponse)
def create_routine(
    data: RoutineCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        if data.is_active:
            db.execute(
                update(Routine)
                .where(
                    Routine.user_id == str(current_user.id),
                    Routine.is_active == True,
                    Routine.is_deleted == False
                )
                .values(is_active=False)
            )
        
        routine = Routine(
            user_id=str(current_user.id),
            name=data.name,
            description=data.description,
            is_active=data.is_active,
            is_deleted=False
        )
        
        db.add(routine)
        db.flush()
        
        for day_data in data.days:
            
            day = RoutineDay(
                routine_id=routine.id,
                day_of_week=day_data.day_of_week,
                name=day_data.name,
                is_rest_day=day_data.is_rest_day,
                is_deleted=False
            )

            db.add(day)
            db.flush()
            
            if day_data.is_rest_day and day_data.exercises:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Rest day cannot have exercises for day {day_data.day_of_week}."
                )
            
            for item in day_data.exercises:
                
                exercise = db.scalar(
                        select(Exercise).where(
                            Exercise.id == item.exercise_id,
                            Exercise.is_deleted.is_(False)
                        )
                    )
                
                if exercise is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Exercise with ID {item.exercise_id} not found."
                    )
                
                if exercise.created_by is not None and exercise.created_by != str(current_user.id):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"You do not have permission to use the exercise with ID {item.exercise_id}."
                    )
                
                if exercise.tracking_type in ["reps", "reps_weight"]:
                    if item.planned_reps is None:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Planned reps must be provided for exercise with ID {item.exercise_id}."
                        )
                        
                    if item.planned_duration_seconds is not None:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Planned duration should not be provided for exercise with ID {item.exercise_id}."
                        )
                
                elif exercise.tracking_type in ["duration", "duration_weight"]:
                    if item.planned_duration_seconds is None:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Planned duration must be provided for exercise with ID {item.exercise_id}."
                        )
                    
                    if item.planned_reps is not None:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Planned reps should not be provided for exercise with ID {item.exercise_id}."
                        )
                
                routine_exercise = RoutineExercise(
                    routine_day_id=day.id,
                    exercise_id=exercise.id,
                    exercise_order=item.exercise_order,
                    planned_sets=item.planned_sets,
                    planned_reps=item.planned_reps,
                    planned_duration_seconds=item.planned_duration_seconds,
                )
                
                db.add(routine_exercise)
                
            

        db.commit()
        db.refresh(routine)

        return routine
    
    except HTTPException as e:
        db.rollback()
        raise e

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    



@router.get("/{routine_id}", response_model=RoutineResponse)
def get_routine(routine_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    
    routine = db.query(Routine).options(
        joinedload(Routine.days)
        .joinedload(RoutineDay.exercises)
        .joinedload(RoutineExercise.exercise),
        
        with_loader_criteria(
            RoutineDay,
            RoutineDay.is_deleted.is_(False),
            include_aliases=True
        )
    ).filter(
        Routine.user_id == str(current_user.id),
        Routine.is_deleted.is_(False),
        Routine.id == routine_id
    ).first()
    
    if routine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Routine with ID {routine_id} not found."
        )
    
    return routine