from pydantic import BaseModel
from app.schemas.progress import WeeklyVolumePoint


class HomeProfile(BaseModel):
    id: str
    username: str | None = None
    profile_pic_url: str | None = None
    level: str | None = None
    goal: str | None = None
    height_cm: float | None = None
    weight_kg: float | None = None


class HomeExercise(BaseModel):
    id: str
    name: str
    muscle_group: str | None = None
    planned_sets: int | None = None
    planned_reps: int | None = None
    planned_duration_seconds: int | None = None


class HomeWorkout(BaseModel):
    routine_id: str | None = None
    routine_day_id: str | None = None
    name: str | None = None
    groups: list[str]
    exercises: list[HomeExercise]
    duration: int


class WeeklyStat(BaseModel):
    visited: bool
    volume: float


class HomeResponse(BaseModel):
    profile: HomeProfile
    streak: int
    workout: HomeWorkout
    weekly_volume: list[WeeklyVolumePoint]
    personal_best: dict | None = None
    coach_insight: str | None = None
