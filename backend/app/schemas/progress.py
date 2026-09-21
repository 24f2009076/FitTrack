from datetime import date, datetime
from pydantic import BaseModel

class ProgressSummary(BaseModel):
    workouts_completed: int
    total_volume_kg: float
    volume_change_percent: float | None
    training_time_seconds: int
    

class RecentWorkout(BaseModel):
    session_id: str
    name: str
    completed_at: datetime
    duration_seconds: int
    set_count: int
    volume_kg: float
 
 
class WeeklyVolumePoint(BaseModel):
    week_start: date
    volume_kg: float   
    
    
class ExerciseProgressHistoryPoint(BaseModel):
    date: datetime
    value: float


class ExerciseProgressItem(BaseModel):
    exercise_id: str
    exercise_name: str
    tracking_type: str

    start_value: float
    current_value: float

    change: float
    change_percent: float | None

    unit: str

    history: list[ExerciseProgressHistoryPoint]

    
class ProgressOverviewResponse(BaseModel):
    range: str
    summary: ProgressSummary
    weekly_volume: list[WeeklyVolumePoint]
    exercise_progress: list[ExerciseProgressItem]
    recent_workouts: list[RecentWorkout]




    