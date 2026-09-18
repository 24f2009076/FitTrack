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
    # 2. Select current routine day
    # --------------------------------

    routine, selected_day = get_current_routine_day(
        db=db,
        routine_id=data.routine_id,
        user_id=str(current_user.id)
    )

    routine_day = (
        db.query(RoutineDay)
        .options(
            joinedload(RoutineDay.exercises)
            .joinedload(RoutineExercise.exercise)
        )
        .filter(
            RoutineDay.id ==selected_day.id,
            RoutineDay.routine_id == routine.id,
            RoutineDay.is_deleted.is_(False)
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
            WorkoutSession.id != session.id,
            WorkoutSession.completed_at < session.started_at
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
        .with_for_update()
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
        .with_for_update()
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

        # Find the routine this session belongs to.
        completed_day = (
            db.query(RoutineDay)
            .filter(RoutineDay.id == session.routine_day_id)
            .first()
        )

        routine = None

        if completed_day is not None:
            routine = (
                db.query(Routine)
                .filter(
                    Routine.id == completed_day.routine_id,
                    Routine.user_id == current_user.id,
                    Routine.is_deleted.is_(False)
                )
                .with_for_update()
                .first()
            )

        # Only advance if this session completed the current position.
        # A repeat of an earlier day should leave progress unchanged.
        if (
            routine is not None
            and routine.current_routine_day_id == session.routine_day_id
        ):
            routine_days = (
                db.query(RoutineDay)
                .filter(
                    RoutineDay.routine_id == routine.id,
                    RoutineDay.is_deleted.is_(False)
                )
                .all()
            )

            # Monday-first ordering: 1, 2, 3, 4, 5, 6, 0.
            ordered_days = sorted(
                routine_days,
                key=lambda day: (day.day_of_week + 6) % 7
            )

            current_index = next(
                (
                    index
                    for index, day in enumerate(ordered_days)
                    if day.id == session.routine_day_id
                ),
                None
            )

            if current_index is not None:
                next_index = (current_index + 1) % len(ordered_days)
                routine.current_routine_day_id = ordered_days[next_index].id

    
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
    
    

def get_current_routine_day(
    db: Session,
    routine_id: str,
    user_id: str
) -> tuple[Routine, RoutineDay]:
    routine = (
        db.query(Routine)
        .filter(
            Routine.id == routine_id,
            Routine.user_id == user_id,
            Routine.is_deleted.is_(False)
        )
        .with_for_update()
        .first()
    )

    if routine is None:
        raise HTTPException(
            status_code=404,
            detail="Routine not found"
        )

    routine_days = (
        db.query(RoutineDay)
        .filter(
            RoutineDay.routine_id == routine.id,
            RoutineDay.is_deleted.is_(False)
        )
        .all()
    )

    ordered_days = sorted(
        routine_days,
        key=lambda day: (day.day_of_week + 6) % 7
    )

    if not ordered_days:
        raise HTTPException(
            status_code=400,
            detail="This routine has no days"
        )

    day_ids = [day.id for day in ordered_days]

    if routine.current_routine_day_id is None:
        previous_session = (
            db.query(WorkoutSession)
            .join(
                RoutineDay,
                WorkoutSession.routine_day_id == RoutineDay.id
            )
            .filter(
                RoutineDay.routine_id == routine.id,
                WorkoutSession.user_id == user_id,
                WorkoutSession.status == "completed",
                WorkoutSession.is_deleted.is_(False)
            )
            .order_by(
                WorkoutSession.completed_at.desc(),
                WorkoutSession.id.desc()
            )
            .first()
        )

        if (
            previous_session is not None
            and previous_session.routine_day_id in day_ids
        ):
            previous_index = day_ids.index(
                previous_session.routine_day_id
            )
            next_index = (previous_index + 1) % len(day_ids)

            routine.current_routine_day_id = day_ids[next_index]
        else:
            routine.current_routine_day_id = day_ids[0]

    elif routine.current_routine_day_id not in day_ids:
        # The previously selected day has been removed.
        routine.current_routine_day_id = day_ids[0]

    current_day = next(
        day
        for day in ordered_days
        if day.id == routine.current_routine_day_id
    )

    return routine, current_day    


@router.get("/routine/{routine_id}/current-day")
def preview_current_routine_day(
    routine_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        routine, routine_day = get_current_routine_day(
            db=db,
            routine_id=routine_id,
            user_id=str(current_user.id)
        )

        existing_session = (
            db.query(WorkoutSession)
            .filter(
                WorkoutSession.user_id == str(current_user.id),
                WorkoutSession.status == "in_progress",
                WorkoutSession.is_deleted.is_(False)
            )
            .first()
        )

        result = {
            "routine_id": routine.id,
            "routine_day_id": routine_day.id,
            "day_number": (
                (routine_day.day_of_week + 6) % 7
            ) + 1,
            "name": routine_day.name,
            "is_rest_day": routine_day.is_rest_day,
            "exercise_count": len(routine_day.exercises),
            "in_progress_session_id": (
                existing_session.id
                if existing_session is not None
                else None
            )
        }

        db.commit()
        return result

    except Exception:
        db.rollback()
        raise
    
    
    

@router.patch("/routine/{routine_id}/skip-rest-day")
def skip_rest_day(
    routine_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        routine, current_day = get_current_routine_day(
            db=db,
            routine_id=routine_id,
            user_id=str(current_user.id)
        )

        if not current_day.is_rest_day:
            raise HTTPException(
                status_code=400,
                detail="The current routine day is not a rest day"
            )

        existing_session = (
            db.query(WorkoutSession)
            .filter(
                WorkoutSession.user_id == str(current_user.id),
                WorkoutSession.status == "in_progress",
                WorkoutSession.is_deleted.is_(False)
            )
            .first()
        )

        if existing_session is not None:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Finish or abandon your current workout "
                    "before skipping a rest day"
                )
            )

        routine_days = (
            db.query(RoutineDay)
            .filter(
                RoutineDay.routine_id == routine.id,
                RoutineDay.is_deleted.is_(False)
            )
            .all()
        )

        ordered_days = sorted(
            routine_days,
            key=lambda day: (day.day_of_week + 6) % 7
        )

        current_index = next(
            (
                index
                for index, day in enumerate(ordered_days)
                if day.id == current_day.id
            ),
            None
        )

        if current_index is None:
            raise HTTPException(
                status_code=400,
                detail="Current routine day is no longer available"
            )

        next_index = (current_index + 1) % len(ordered_days)
        next_day = ordered_days[next_index]

        routine.current_routine_day_id = next_day.id

        result = {
            "routine_id": routine.id,
            "routine_day_id": next_day.id,
            "day_number": (
                (next_day.day_of_week + 6) % 7
            ) + 1,
            "name": next_day.name,
            "is_rest_day": next_day.is_rest_day,
            "exercise_count": len(next_day.exercises),
            "in_progress_session_id": None
        }

        db.commit()

        return result

    except Exception:
        db.rollback()
        raise
    
    
    
    
    
    
    
    
    
    
    
    