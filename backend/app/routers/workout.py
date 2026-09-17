from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.routine import Routine, RoutineDay
from app.models.workout import WorkoutSession, WorkoutSessionExercise, WorkoutSet
from app.schemas.workout import WorkoutSetCreate, WorkoutStartRequest
from app.auth import get_current_user
from app.models.routine import Routine, RoutineDay, RoutineExercise


router = APIRouter(
    prefix="/api/workout-sessions",
    tags=["Workout Sessions"]
)


@router.post("/start")
def start_workout(
    data: WorkoutStartRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # --------------------------------
    # 1. Check for existing workout
    # --------------------------------

    existing_session = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.status == "in_progress",
            WorkoutSession.is_deleted == False
        )
        .first()
    )

    if existing_session:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "You already have a workout in progress",
                "session_id": existing_session.id
            }
        )

    # --------------------------------
    # 2. Find requested routine day
    # --------------------------------

    routine_day = (
        db.query(RoutineDay)
        .join(Routine)
        .options(
            joinedload(RoutineDay.exercises)
            .joinedload(RoutineExercise.exercise)
        )
        .filter(
            RoutineDay.id == data.routine_day_id,
            Routine.user_id == current_user.id,
            Routine.is_deleted == False,
            RoutineDay.is_deleted == False
        )
        .first()
    )

    if not routine_day:
        raise HTTPException(
            status_code=404,
            detail="Routine day not found"
        )

    # --------------------------------
    # 3. Reject rest days
    # --------------------------------

    if routine_day.is_rest_day:
        raise HTTPException(
            status_code=400,
            detail="Cannot start a workout on a rest day"
        )

    if not routine_day.exercises:
        raise HTTPException(
            status_code=400,
            detail="This routine day has no exercises"
        )

    # --------------------------------
    # 4. Create workout session
    # --------------------------------

    workout_session = WorkoutSession(
        user_id=current_user.id,
        routine_day_id=routine_day.id,
        started_at=datetime.now(timezone.utc),
        status="in_progress",
        is_deleted=False
    )

    db.add(workout_session)

    # Generates the session ID before commit
    db.flush()

    # --------------------------------
    # 5. Snapshot routine exercises
    # --------------------------------

    ordered_exercises = sorted(
        routine_day.exercises,
        key=lambda x: x.exercise_order
    )

    for index, routine_exercise in enumerate(ordered_exercises):

        session_exercise = WorkoutSessionExercise(
            workout_session_id=workout_session.id,

            exercise_id=routine_exercise.exercise_id,

            exercise_name=routine_exercise.exercise.name,

            tracking_type=routine_exercise.exercise.tracking_type,

            exercise_order=routine_exercise.exercise_order,

            planned_sets=routine_exercise.planned_sets,

            planned_reps=routine_exercise.planned_reps,

            planned_duration_seconds=
                routine_exercise.planned_duration_seconds,

            status="current" if index == 0 else "upcoming",

            started_at=(
                datetime.now(timezone.utc)
                if index == 0
                else None
            )
        )

        db.add(session_exercise)

    # --------------------------------
    # 6. Save everything
    # --------------------------------

    db.commit()
    db.refresh(workout_session)

    return {
        "id": workout_session.id,
        "routine_day_id": workout_session.routine_day_id,
        "status": workout_session.status,
        "started_at": workout_session.started_at
    }
    

@router.get("/{session_id}")
def get_workout_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    
    # debug_exercises = (
    #     db.query(WorkoutSessionExercise)
    #     .filter(
    #         WorkoutSessionExercise.workout_session_id == session_id
    #     )
    #     .order_by(WorkoutSessionExercise.exercise_order)
    #     .all()
    # )

    # print("DIRECT QUERY COUNT:", len(debug_exercises))

    # for exercise in debug_exercises:
    #     print(
    #         exercise.exercise_order,
    #         exercise.exercise_name,
    #         exercise.status
    #     )

    # print(
    #     "RELATIONSHIP COUNT:",
    #     len(session.session_exercises)
    # )
    
    session = (
        db.query(WorkoutSession)
        .options(
            joinedload(WorkoutSession.session_exercises)
            .joinedload(WorkoutSessionExercise.sets)
        )
        .filter(
            WorkoutSession.id == session_id,
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.is_deleted == False
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Workout session not found"
        )
    
    exercises = sorted(
            session.session_exercises,
            key=lambda exercise: exercise.exercise_order
        )
        
    previous_session = (
        db.query(WorkoutSession)
        .options(
            joinedload(WorkoutSession.session_exercises)
            .joinedload(WorkoutSessionExercise.sets)
        )
        .filter(
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.routine_day_id == session.routine_day_id,
            WorkoutSession.is_deleted == False,
            WorkoutSession.status == "completed",
            WorkoutSession.id != session.id
        )
        .order_by(WorkoutSession.completed_at.desc())
        .first()
    )
    
    previous_exercises = {}
    
    if previous_session:
        previous_exercises = {
            exercise.exercise_id: exercise
            for exercise in previous_session.session_exercises
        }
    
    exercise_response = []
    
    for exercise in exercises:
        previous_exercise = previous_exercises.get(exercise.exercise_id)
        
        previous_performance = None
        if previous_exercise:
            previous_sets = sorted(
                previous_exercise.sets,
                key=lambda s: s.set_number
            )
            
            previous_performance = {
            "session_id": previous_session.id,
            "completed_at": previous_session.completed_at,

            "sets": [
                {
                    "set_number": workout_set.set_number,
                    "reps": workout_set.reps,
                    "weight_kg": (
                        float(workout_set.weight_kg)
                        if workout_set.weight_kg is not None
                        else None
                    ),
                    "duration_seconds":
                        workout_set.duration_seconds
                }
                for workout_set in previous_sets
            ]
        }

        current_sets = sorted(
            exercise.sets,
            key=lambda workout_set: workout_set.set_number
        )

        exercise_response.append(
        {
            "id": exercise.id,
            "exercise_id": exercise.exercise_id,
            "name": exercise.exercise_name,
            "tracking_type": exercise.tracking_type,
            "exercise_order": exercise.exercise_order,

            "planned_sets": exercise.planned_sets,
            "planned_reps": exercise.planned_reps,
            "planned_duration_seconds":
                exercise.planned_duration_seconds,

            "status": exercise.status,

            "sets": [
                {
                    "id": workout_set.id,
                    "set_number": workout_set.set_number,
                    "reps": workout_set.reps,
                    "weight_kg": (
                        float(workout_set.weight_kg)
                        if workout_set.weight_kg is not None
                        else None
                    ),
                    "duration_seconds":
                        workout_set.duration_seconds
                }
                for workout_set in current_sets
            ],

            "previous_performance": previous_performance
        }
    )

    

    return {
        "id": session.id,
        "routine_day_id": session.routine_day_id,
        "status": session.status,
        "started_at": session.started_at,
        "completed_at": session.completed_at,

        "exercises": exercise_response
    }
    


@router.patch("/{session_id}/abandon")
def abandon_workout(
    session_id: str,
    db: Session=Depends(get_db),
    current_user=Depends(get_current_user)
):
    session = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.id == session_id,
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.is_deleted == False
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Workout session not found"
        )
    
    if session.status != "in_progress":
        raise HTTPException(
            status_code=400,
            detail="Only in-progress sessions can be abandoned"
        )

    session.status = "abandoned"
    session.completed_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "id": session.id,
        "status": session.status,
        "completed_at": session.completed_at
    }    
    
    

@router.post("/{session_id}/exercises/{exercise_id}/sets")
def complete_workout_set(
    session_id: str,
    exercise_id: str,
    data: WorkoutSetCreate,
    db: Session=Depends(get_db),
    current_user=Depends(get_current_user)
):
    session = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.id == session_id,
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.is_deleted == False,
            WorkoutSession.status == "in_progress"
        )
        .first()
    )
    
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Workout session not found or not in progress"
        )
    
    session_exercise = (
        db.query(WorkoutSessionExercise)
        .filter(
            WorkoutSessionExercise.id == exercise_id,
            WorkoutSessionExercise.workout_session_id == session.id
        )
        .first()
    )
    
    if not session_exercise:
        raise HTTPException(
            status_code=404,
            detail="Workout session exercise not found"
        )
    
    if session_exercise.status != "current":
        raise HTTPException(
            status_code=400,
            detail="Exercise is not currently active"
        )
    
    existing_sets = (
        db.query(WorkoutSet)
        .filter(
            WorkoutSet.workout_session_exercise_id == session_exercise.id,
        )
        .order_by(
            WorkoutSet.set_number.asc()
        )
        .all()
    )
    
    expected_set_number = len(existing_sets) + 1

    if data.set_number != expected_set_number:
        raise HTTPException(
            status_code=400,
            detail=f"Expected set number {expected_set_number}, got {data.set_number}"
        )
    
    if data.set_number > session_exercise.planned_sets:
        raise HTTPException(
            status_code=400,
            detail=f"Set number {data.set_number} exceeds planned sets {session_exercise.planned_sets}"
        )
    
    tracking_type = session_exercise.tracking_type
    
    if tracking_type in ("reps", "reps_weight"):
        if data.reps is None:
            raise HTTPException(
                status_code=400,
                detail="Reps must be provided for reps tracking type"
            )
    
    if tracking_type in ("duration", "duration_weight"):
        if data.duration_seconds is None:
            raise HTTPException(
                status_code=400,
                detail="Duration must be provided for duration tracking type"
            )
    
    if tracking_type in ("reps_weight", "duration_weight"):
        if data.weight_kg is None:
            raise HTTPException(
                status_code=400,
                detail="Weight must be provided for weight tracking types"
            )
    
    
    if data.reps is not None and data.reps < 0:
        raise HTTPException(
            status_code=400,
            detail="Reps cannot be negative"
        )
    
    if data.weight_kg is not None and data.weight_kg < 0:
        raise HTTPException(
            status_code=400,
            detail="Weight cannot be negative"
        )
    
    if data.duration_seconds is not None and data.duration_seconds < 0:
        raise HTTPException(
            status_code=400,
            detail="Duration cannot be negative"
        )
        
    
    workout_set = WorkoutSet(
        workout_session_exercise_id=session_exercise.id,
        set_number=data.set_number,
        reps=data.reps,
        weight_kg=data.weight_kg,
        duration_seconds=data.duration_seconds
    )
    
    db.add(workout_set)
    db.flush()
    
    is_final_set = (
        data.set_number >= session_exercise.planned_sets
    )
    
    if not is_final_set:
        db.commit()
        
        return {
            "message": "Set Completed",
            "set": {
                "id": workout_set.id,
                "set_number": workout_set.set_number,
                "reps": workout_set.reps,
                "weight_kg": (
                    float(workout_set.weight_kg)
                    if workout_set.weight_kg is not None
                    else None
                ),
                "duration_seconds": workout_set.duration_seconds
            },
            "exercise_completed": False,
            "workout_completed": False
        }
    
    session_exercise.status = "completed"
    
    next_exercise = (
        db.query(WorkoutSessionExercise)
        .filter(
            WorkoutSessionExercise.workout_session_id == session_id,
            WorkoutSessionExercise.status == "upcoming",
            WorkoutSessionExercise.exercise_order > session_exercise.exercise_order
        )
        .order_by(
            WorkoutSessionExercise.exercise_order.asc()
        )
        .first()
    )
    
    if next_exercise:
        next_exercise.status = "current"
    else:
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {
        "message": "Set completed",
        "set": {
            "id": workout_set.id,
            "set_number": workout_set.set_number,
            "reps": workout_set.reps,
            "weight_kg": (
                float(workout_set.weight_kg)
                if workout_set.weight_kg is not None
                else None
            ),
            "duration_seconds":
                workout_set.duration_seconds,
        },
        "exercise_completed": True,
        "workout_completed": next_exercise is None,
        "next_exercise_id": (
            next_exercise.id
            if next_exercise
            else None
        ),
    }
    
    
    
    