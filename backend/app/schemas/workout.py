from pydantic import BaseModel


class WorkoutStartRequest(BaseModel):
    routine_day_id: str


class WorkoutSetCreate(BaseModel):
    set_number: int
    reps: int | None = None
    weight_kg: float | None = None
    duration_seconds: int | None = None