from pydantic import BaseModel, Field
from typing import Optional

class ExerciseResponse(BaseModel):
    id: str
    name: str
    description: str | None
    primary_muscle: str | None
    equipment: str | None


class RoutineExerciseResponse(BaseModel):
    id: str
    exercise_id: str
    exercise_order: int
    
    planned_sets: int | None
    planned_reps: Optional[int] = None
    planned_duration_seconds: Optional[int] = None
    exercise: ExerciseResponse 
    
    class Config:
        from_attributes = True


class RoutineDayResponse(BaseModel):
    id: str
    day_of_week: int
    name: Optional[str] = None
    is_rest_day: bool
    exercises: list[RoutineExerciseResponse] = []
    
    class Config:
        from_attributes = True


class RoutineResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    is_active: bool
    is_deleted: bool
    days: list[RoutineDayResponse]
    
    class Config:
        from_attributes = True
    
    

class RoutineExerciseCreate(BaseModel):
    exercise_id: str
    exercise_order: int = Field(ge=1)
    
    planned_sets: int | None = Field(default=None, ge=1)
    planned_reps: Optional[int] = None
    planned_duration_seconds: Optional[int] = None


class RoutineDayCreate(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    name: Optional[str] = None
    is_rest_day: bool = False
    exercises: list[RoutineExerciseCreate] = []


class RoutineCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: bool = False
    
    days: list[RoutineDayCreate] = Field(default_factory=list)
    
    
    
    
