from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, Date, cast
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.workout import WorkoutSession, WorkoutSet, WorkoutSessionExercise
from app.models.routine import RoutineDay
from app.models.exercise import Exercise

from app.schemas.progress import (
    ProgressOverviewResponse,
    ProgressSummary,
    RecentWorkout,
    WeeklyVolumePoint,
    ExerciseProgressItem,
    ExerciseProgressHistoryPoint,
    RecentWorkout
)

from app.auth import get_current_user


router = APIRouter(
    prefix="/api/progress",
    tags=["Progress"],
)

def get_range_dates(range_value: str):
    now = datetime.now(timezone.utc)

    ranges = {
        "7d": 7,
        "30d": 30,
        "3m": 90,
        "6m": 180,
        "1y": 365,
    }

    if range_value == "all":
        return None, now, None

    days = ranges.get(range_value)

    if days is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid progress range",
        )

    start = now - timedelta(days=days)

    previous_start = start - timedelta(days=days)

    return start, now, previous_start





@router.get(
    "/overview",
    response_model=ProgressOverviewResponse,
)
def get_progress_overview(
    range: str = Query(default="30d"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    start_date, end_date, previous_start = get_range_dates(range)

    user_id = current_user.id

    # ---------------------------------
    # Base completed sessions query
    # ---------------------------------

    sessions_query = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.status == "completed",
        WorkoutSession.completed_at.isnot(None),
    )

    if start_date:
        sessions_query = sessions_query.filter(
            WorkoutSession.completed_at >= start_date
        )

    sessions_query = sessions_query.filter(
        WorkoutSession.completed_at <= end_date
    )

    completed_sessions = sessions_query.all()

    # ---------------------------------
    # 1. Completed workout count
    # ---------------------------------

    workouts_completed = len(completed_sessions)

    # ---------------------------------
    # 2. Total training time
    # ---------------------------------

    training_time_seconds = sum(
        int(
            (
                session.completed_at
                - session.started_at
            ).total_seconds()
        )
        for session in completed_sessions
        if session.completed_at
    )
    
    volume_query = (
        db.query(
            func.coalesce(
                func.sum(
                    WorkoutSet.reps * WorkoutSet.weight_kg
                ),
                0,
            )
        )
        .join(
            WorkoutSessionExercise,
            WorkoutSet.workout_session_exercise_id
            == WorkoutSessionExercise.id,
        )
        .join(
            WorkoutSession,
            WorkoutSessionExercise.workout_session_id
            == WorkoutSession.id,
        )
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "completed",
            WorkoutSession.completed_at.isnot(None),
        )
    )

    if start_date:
        volume_query = volume_query.filter(
            WorkoutSession.completed_at >= start_date
        )

    volume_query = volume_query.filter(
        WorkoutSession.completed_at <= end_date
    )

    total_volume_kg = float(volume_query.scalar() or 0)
    
    volume_change_percent = None

    if previous_start is not None and start_date is not None:

        previous_volume_query = (
            db.query(
                func.coalesce(
                    func.sum(
                        WorkoutSet.reps * WorkoutSet.weight_kg
                    ),
                    0,
                )
            )
            .join(
                WorkoutSessionExercise,
                WorkoutSet.workout_session_exercise_id
                == WorkoutSessionExercise.id,
            )
            .join(
                WorkoutSession,
                WorkoutSessionExercise.workout_session_id
                == WorkoutSession.id,
            )
            .filter(
                WorkoutSession.user_id == user_id,
                WorkoutSession.status == "completed",
                WorkoutSession.completed_at >= previous_start,
                WorkoutSession.completed_at < start_date,
            )
        )

        previous_volume = float(
            previous_volume_query.scalar() or 0
        )

        if previous_volume > 0:
            volume_change_percent = round(
                (
                    (total_volume_kg - previous_volume)
                    / previous_volume
                )
                * 100,
                1,
            )
    
    # ---------------------------------
    # 3. Weekly volume
    # ---------------------------------

    week_start_expr = cast(
        func.date_trunc(
            "week",
            WorkoutSession.completed_at,
        ),
        Date,
    )

    weekly_volume_query = (
        db.query(
            week_start_expr.label("week_start"),
            func.coalesce(
                func.sum(
                    WorkoutSet.reps * WorkoutSet.weight_kg
                ),
                0,
            ).label("volume_kg"),
        )
        .join(
            WorkoutSessionExercise,
            WorkoutSet.workout_session_exercise_id
            == WorkoutSessionExercise.id,
        )
        .join(
            WorkoutSession,
            WorkoutSessionExercise.workout_session_id
            == WorkoutSession.id,
        )
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "completed",
            WorkoutSession.completed_at.isnot(None),
        )
    )
    
    if start_date:
        weekly_volume_query = weekly_volume_query.filter(
            WorkoutSession.completed_at >= start_date
        )

    weekly_volume_rows = (
        weekly_volume_query
        .filter(
            WorkoutSession.completed_at <= end_date
        )
        .group_by(
            week_start_expr
        )
        .order_by(
            week_start_expr
        )
        .all()
    )
    
    weekly_volume = []

    volume_by_week = {
        row.week_start: float(row.volume_kg or 0)
        for row in weekly_volume_rows
    }
    
    if start_date:

        current_week = (
            start_date
            - timedelta(days=start_date.weekday())
        ).date()

    else:

        if weekly_volume_rows:
            current_week = weekly_volume_rows[0].week_start
        else:
            current_week = None
    
    end_week = (
        end_date
        - timedelta(days=end_date.weekday())
    ).date()
    
    while current_week and current_week <= end_week:

        weekly_volume.append(
            WeeklyVolumePoint(
                week_start=current_week,
                volume_kg=round(
                    volume_by_week.get(current_week, 0),
                    2,
                ),
            )
        )

        current_week += timedelta(days=7)
                
    
    recent_rows_query = (
        db.query(
            WorkoutSession.id.label("session_id"),
            RoutineDay.name.label("workout_name"),
            WorkoutSession.started_at,
            WorkoutSession.completed_at,

            func.count(
                WorkoutSet.id
            ).label("set_count"),

            func.coalesce(
                func.sum(
                    WorkoutSet.reps * WorkoutSet.weight_kg
                ),
                0,
            ).label("volume_kg"),
        )
        .join(
            RoutineDay,
            WorkoutSession.routine_day_id
            == RoutineDay.id,
        )
        .outerjoin(
            WorkoutSessionExercise,
            WorkoutSessionExercise.workout_session_id
            == WorkoutSession.id,
        )
        .outerjoin(
            WorkoutSet,
            WorkoutSet.workout_session_exercise_id
            == WorkoutSessionExercise.id,
        )
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "completed",
            WorkoutSession.completed_at.isnot(None),
        )
    )
    
    if start_date:
        recent_rows_query = recent_rows_query.filter(
            WorkoutSession.completed_at >= start_date
        )

    recent_rows = (
        recent_rows_query
        .filter(
            WorkoutSession.completed_at <= end_date
        )
        .group_by(
            WorkoutSession.id,
            RoutineDay.name,
            WorkoutSession.started_at,
            WorkoutSession.completed_at,
        )
        .order_by(
            WorkoutSession.completed_at.desc()
        )
        .limit(3)
        .all()
    )

        
    recent_workouts = []

    for row in recent_rows:

        duration_seconds = int(
            (
                row.completed_at
                - row.started_at
            ).total_seconds()
        )

        recent_workouts.append(
            RecentWorkout(
                session_id=str(row.session_id),
                name=row.workout_name or "Workout",
                completed_at=row.completed_at,
                duration_seconds=duration_seconds,
                set_count=row.set_count or 0,
                volume_kg=float(row.volume_kg or 0),
            )
        )
    
    # ---------------------------------
    # 4. Exercise progress
    # ---------------------------------

    exercise_progress_query = (
        db.query(
            WorkoutSession.id.label("session_id"),
            WorkoutSession.completed_at,

            WorkoutSessionExercise.exercise_id,
            WorkoutSessionExercise.tracking_type,

            Exercise.name.label("exercise_name"),

            WorkoutSet.reps,
            WorkoutSet.weight_kg,
            WorkoutSet.duration_seconds,
        )
        .join(
            WorkoutSessionExercise,
            WorkoutSet.workout_session_exercise_id
            == WorkoutSessionExercise.id,
        )
        .join(
            WorkoutSession,
            WorkoutSessionExercise.workout_session_id
            == WorkoutSession.id,
        )
        .join(
            Exercise,
            WorkoutSessionExercise.exercise_id
            == Exercise.id,
        )
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "completed",
            WorkoutSession.completed_at.isnot(None),
        )
    )
    
    if start_date:
        exercise_progress_query = exercise_progress_query.filter(
            WorkoutSession.completed_at >= start_date
        )

    exercise_progress_rows = (
        exercise_progress_query
        .filter(
            WorkoutSession.completed_at <= end_date
        )
        .order_by(
            WorkoutSession.completed_at.asc()
        )
        .all()
    )
    
    exercise_sessions = {}
    
    for row in exercise_progress_rows:

        exercise_id = str(row.exercise_id)
        session_id = str(row.session_id)

        tracking_type = row.tracking_type

        # ---------------------------------
        # Pick the correct metric
        # ---------------------------------

        value = None
        unit = None

        if tracking_type == "reps_weight":
            if row.weight_kg is not None:
                value = float(row.weight_kg)
                unit = "kg"

        elif tracking_type == "reps":
            if row.reps is not None:
                value = float(row.reps)
                unit = "reps"

        elif tracking_type == "duration":
            if row.duration_seconds is not None:
                value = float(row.duration_seconds)
                unit = "sec"

        elif tracking_type == "duration_weight":
            if row.weight_kg is not None:
                value = float(row.weight_kg)
                unit = "kg"

        if value is None:
            continue
        
        if exercise_id not in exercise_sessions:
            exercise_sessions[exercise_id] = {
                "exercise_name": row.exercise_name,
                "tracking_type": tracking_type,
                "unit": unit,
                "sessions": {},
            }

        sessions = exercise_sessions[exercise_id]["sessions"]
        
        if session_id not in sessions:
            sessions[session_id] = {
                "completed_at": row.completed_at,
                "value": value,
            }

        else:
            sessions[session_id]["value"] = max(
                sessions[session_id]["value"],
                value,
            )
    
    exercise_progress = []
    
    for exercise_id, data in exercise_sessions.items():

        session_history = sorted(
            data["sessions"].values(),
            key=lambda item: item["completed_at"],
        )

        # We need at least two workouts before
        # "progress" really means anything.
        if len(session_history) < 2:
            continue

        start_value = session_history[0]["value"]
        current_value = session_history[-1]["value"]

        change = current_value - start_value

        if start_value > 0:
            change_percent = round(
                (change / start_value) * 100,
                2,
            )
        else:
            change_percent = None
    

        history = [
            ExerciseProgressHistoryPoint(
                date=item["completed_at"],
                value=round(item["value"], 2),
            )
            for item in session_history
        ]
        
        exercise_progress.append(
            ExerciseProgressItem(
                exercise_id=exercise_id,
                exercise_name=data["exercise_name"],
                tracking_type=data["tracking_type"],

                start_value=round(start_value, 2),
                current_value=round(current_value, 2),

                change=round(change, 2),
                change_percent=change_percent,

                unit=data["unit"],

                history=history,
            )
        )
        
    exercise_progress.sort(
        key=lambda item: (
            item.change_percent
            if item.change_percent is not None
            else float("-inf")
        ),
        reverse=True,
    )
        
    exercise_progress = exercise_progress[:3]
    
    return ProgressOverviewResponse(
        range=range,
        summary=ProgressSummary(
            workouts_completed=workouts_completed,
            total_volume_kg=round(total_volume_kg, 2),
            volume_change_percent=volume_change_percent,
            training_time_seconds=training_time_seconds,
        ),
        weekly_volume=weekly_volume,
        exercise_progress=exercise_progress,
        recent_workouts=recent_workouts,
    )



@router.get(
    "/exercises",
    response_model=list[ExerciseProgressItem],
)
def get_all_exercise_progress(
    range: str = Query(default="30d"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    start_date, end_date, _ = get_range_dates(range)

    user_id = current_user.id

    exercise_progress_query = (
        db.query(
            WorkoutSession.id.label("session_id"),
            WorkoutSession.completed_at,

            WorkoutSessionExercise.exercise_id,
            WorkoutSessionExercise.tracking_type,

            Exercise.name.label("exercise_name"),

            WorkoutSet.reps,
            WorkoutSet.weight_kg,
            WorkoutSet.duration_seconds,
        )
        .join(
            WorkoutSessionExercise,
            WorkoutSet.workout_session_exercise_id
            == WorkoutSessionExercise.id,
        )
        .join(
            WorkoutSession,
            WorkoutSessionExercise.workout_session_id
            == WorkoutSession.id,
        )
        .join(
            Exercise,
            WorkoutSessionExercise.exercise_id
            == Exercise.id,
        )
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "completed",
            WorkoutSession.completed_at.isnot(None),
        )
    )

    if start_date:
        exercise_progress_query = exercise_progress_query.filter(
            WorkoutSession.completed_at >= start_date
        )

    exercise_progress_rows = (
        exercise_progress_query
        .filter(
            WorkoutSession.completed_at <= end_date
        )
        .order_by(
            WorkoutSession.completed_at.asc()
        )
        .all()
    )

    exercise_sessions = {}

    for row in exercise_progress_rows:

        exercise_id = str(row.exercise_id)
        session_id = str(row.session_id)

        tracking_type = row.tracking_type

        value = None
        unit = None

        if tracking_type == "reps_weight":
            if row.weight_kg is not None:
                value = float(row.weight_kg)
                unit = "kg"

        elif tracking_type == "reps":
            if row.reps is not None:
                value = float(row.reps)
                unit = "reps"

        elif tracking_type == "duration":
            if row.duration_seconds is not None:
                value = float(row.duration_seconds)
                unit = "sec"

        elif tracking_type == "duration_weight":
            if row.weight_kg is not None:
                value = float(row.weight_kg)
                unit = "kg"

        if value is None:
            continue

        if exercise_id not in exercise_sessions:
            exercise_sessions[exercise_id] = {
                "exercise_name": row.exercise_name,
                "tracking_type": tracking_type,
                "unit": unit,
                "sessions": {},
            }

        sessions = exercise_sessions[exercise_id]["sessions"]

        if session_id not in sessions:
            sessions[session_id] = {
                "completed_at": row.completed_at,
                "value": value,
            }

        else:
            sessions[session_id]["value"] = max(
                sessions[session_id]["value"],
                value,
            )

    exercise_progress = []

    for exercise_id, data in exercise_sessions.items():

        session_history = sorted(
            data["sessions"].values(),
            key=lambda item: item["completed_at"],
        )

        # Keep same behavior as overview:
        # progress requires at least 2 completed sessions
        if len(session_history) < 2:
            continue

        start_value = session_history[0]["value"]
        current_value = session_history[-1]["value"]

        change = current_value - start_value

        if start_value > 0:
            change_percent = round(
                (change / start_value) * 100,
                2,
            )
        else:
            change_percent = None

        history = [
            ExerciseProgressHistoryPoint(
                date=item["completed_at"],
                value=round(item["value"], 2),
            )
            for item in session_history
        ]

        exercise_progress.append(
            ExerciseProgressItem(
                exercise_id=exercise_id,
                exercise_name=data["exercise_name"],
                tracking_type=data["tracking_type"],

                start_value=round(start_value, 2),
                current_value=round(current_value, 2),

                change=round(change, 2),
                change_percent=change_percent,

                unit=data["unit"],

                history=history,
            )
        )

    exercise_progress.sort(
        key=lambda item: (
            item.change_percent
            if item.change_percent is not None
            else float("-inf")
        ),
        reverse=True,
    )

    return exercise_progress




@router.get(
    "/workouts",
    response_model=list[RecentWorkout],
)
def get_all_recent_workouts(
    range: str = Query(default="30d"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    start_date, end_date, _ = get_range_dates(range)

    user_id = current_user.id

    recent_rows_query = (
        db.query(
            WorkoutSession.id.label("session_id"),
            RoutineDay.name.label("workout_name"),
            WorkoutSession.started_at,
            WorkoutSession.completed_at,

            func.count(
                WorkoutSet.id
            ).label("set_count"),

            func.coalesce(
                func.sum(
                    WorkoutSet.reps * WorkoutSet.weight_kg
                ),
                0,
            ).label("volume_kg"),
        )
        .join(
            RoutineDay,
            WorkoutSession.routine_day_id
            == RoutineDay.id,
        )
        .outerjoin(
            WorkoutSessionExercise,
            WorkoutSessionExercise.workout_session_id
            == WorkoutSession.id,
        )
        .outerjoin(
            WorkoutSet,
            WorkoutSet.workout_session_exercise_id
            == WorkoutSessionExercise.id,
        )
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "completed",
            WorkoutSession.completed_at.isnot(None),
        )
    )

    if start_date:
        recent_rows_query = recent_rows_query.filter(
            WorkoutSession.completed_at >= start_date
        )

    recent_rows = (
        recent_rows_query
        .filter(
            WorkoutSession.completed_at <= end_date
        )
        .group_by(
            WorkoutSession.id,
            RoutineDay.name,
            WorkoutSession.started_at,
            WorkoutSession.completed_at,
        )
        .order_by(
            WorkoutSession.completed_at.desc()
        )
        # No .limit(3)
        .all()
    )

    recent_workouts = []

    for row in recent_rows:

        duration_seconds = int(
            (
                row.completed_at
                - row.started_at
            ).total_seconds()
        )

        recent_workouts.append(
            RecentWorkout(
                session_id=str(row.session_id),
                name=row.workout_name or "Workout",
                completed_at=row.completed_at,
                duration_seconds=duration_seconds,
                set_count=row.set_count or 0,
                volume_kg=float(row.volume_kg or 0),
            )
        )

    return recent_workouts





