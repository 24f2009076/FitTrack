from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import cast, Date, func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.auth import get_current_user

from app.models.routine import (
    Routine,
    RoutineDay,
    RoutineExercise,
)
from app.models.user import Profile
from app.models.workout import (
    WorkoutSession,
    WorkoutSessionExercise,
    WorkoutSet,
)

from app.schemas.home import HomeResponse


router = APIRouter(
    prefix="/api/home",
    tags=["Home"],
)


@router.get("/", response_model=HomeResponse)
def get_home(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = str(current_user.id)

    # ---------------------------------
    # 1. Profile
    # ---------------------------------

    profile = db.get(Profile, user_id)

    if profile is None:
        return {
            "profile": {
                "id": user_id,
            },
            "streak": 0,
            "workout": {
                "routine_id": None,
                "routine_day_id": None,
                "name": None,
                "is_rest_day": False,
                "groups": [],
                "exercises": [],
                "duration": 0,
            },
            "weekly_volume": [],
        }

    # ---------------------------------
    # 2. Active routine
    # ---------------------------------

    active_routine = (
        db.query(Routine)
        .options(
            joinedload(Routine.days)
            .joinedload(RoutineDay.exercises)
            .joinedload(RoutineExercise.exercise)
        )
        .filter(
            Routine.user_id == user_id,
            Routine.is_active.is_(True),
            Routine.is_deleted.is_(False),
        )
        .first()
    )

    # ---------------------------------
    # 3. Current routine day
    # ---------------------------------

    routine_day = None

    if active_routine:
        routine_days = [
            day
            for day in active_routine.days
            if not day.is_deleted
        ]

        routine_days.sort(
            key=lambda day: (day.day_of_week + 6) % 7
        )

        routine_day = next(
            (
                day
                for day in routine_days
                if day.id == active_routine.current_routine_day_id
            ),
            routine_days[0] if routine_days else None,
        )

    # ---------------------------------
    # 4. Today's/current workout
    # ---------------------------------

    exercises = []
    groups = []
    duration_seconds = 0

    if routine_day and not routine_day.is_rest_day:

        exercises = [
            item
            for item in routine_day.exercises
            if (
                item.exercise
                and not item.exercise.is_deleted
            )
        ]

        groups = list(
            dict.fromkeys(
                item.exercise.primary_muscle
                for item in exercises
                if item.exercise.primary_muscle
            )
        )

        # Duration exercises only for now
        duration_seconds = sum(
            (item.planned_duration_seconds or 0)
            * (item.planned_sets or 1)
            for item in exercises
        )

    # ---------------------------------
    # 5. Completed sessions
    # ---------------------------------

    completed_sessions = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "completed",
            WorkoutSession.completed_at.isnot(None),
            WorkoutSession.is_deleted.is_(False),
        )
        .order_by(
            WorkoutSession.completed_at.desc()
        )
        .all()
    )

    # ---------------------------------
    # 6. Return Home dashboard
    # ---------------------------------

    return {
        "profile": profile,

        "streak": _get_streak(
            completed_sessions
        ),

        "workout": {
            "routine_id":
                str(active_routine.id)
                if active_routine
                else None,

            "routine_day_id":
                str(routine_day.id)
                if routine_day
                else None,

            "name":
                routine_day.name
                if routine_day
                else None,

            "is_rest_day":
                routine_day.is_rest_day
                if routine_day
                else False,

            "groups": groups,

            "exercises": [
                {
                    "id": str(item.exercise.id),

                    "name":
                        item.exercise.name,

                    "muscle_group":
                        item.exercise.primary_muscle,

                    "planned_sets":
                        item.planned_sets,

                    "planned_reps":
                        item.planned_reps,

                    "planned_duration_seconds":
                        item.planned_duration_seconds,
                }
                for item in exercises
            ],

            "duration":
                duration_seconds // 60,
        },

        # Same style of data as Progress
        "weekly_volume": _get_weekly_volume(
            db,
            user_id,
            days=30,
        ),
    }


# ---------------------------------
# Weekly volume
# ---------------------------------

def _get_weekly_volume(
    db: Session,
    user_id: str,
    days: int = 30,
):
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)

    week_start_expr = cast(
        func.date_trunc(
            "week",
            WorkoutSession.completed_at,
        ),
        Date,
    )

    weekly_volume_rows = (
        db.query(
            week_start_expr.label(
                "week_start"
            ),

            func.coalesce(
                func.sum(
                    WorkoutSet.reps
                    * WorkoutSet.weight_kg
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
            WorkoutSession.is_deleted.is_(False),
            WorkoutSession.completed_at >= start_date,
            WorkoutSession.completed_at <= end_date,
        )

        .group_by(
            week_start_expr
        )

        .order_by(
            week_start_expr
        )

        .all()
    )

    volume_by_week = {
        row.week_start:
            float(row.volume_kg or 0)

        for row in weekly_volume_rows
    }

    weekly_volume = []

    current_week = (
        start_date
        - timedelta(
            days=start_date.weekday()
        )
    ).date()

    end_week = (
        end_date
        - timedelta(
            days=end_date.weekday()
        )
    ).date()

    while current_week <= end_week:

        weekly_volume.append({
            "week_start":
                current_week,

            "volume_kg":
                round(
                    volume_by_week.get(
                        current_week,
                        0,
                    ),
                    2,
                ),
        })

        current_week += timedelta(days=7)

    return weekly_volume


# ---------------------------------
# Workout streak
# ---------------------------------

def _get_streak(
    completed_sessions: list[WorkoutSession],
) -> int:

    completed_dates = {
        session.completed_at.date()
        for session in completed_sessions
        if session.completed_at is not None
    }

    current_date = (
        datetime.now(timezone.utc).date()
    )

    # If user hasn't trained today,
    # allow yesterday to continue the streak.
    if current_date not in completed_dates:
        current_date -= timedelta(days=1)

    streak = 0

    while current_date in completed_dates:
        streak += 1
        current_date -= timedelta(days=1)

    return streak