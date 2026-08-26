from pydantic import BaseModel, Field

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
    sets: int | None
    reps: int | None
    notes: str | None
    exercise: ExerciseResponse 


class RoutineDayResponse(BaseModel):
    id: str
    day_of_week: int
    name: str | None
    is_rest_day: bool
    exercises: list[RoutineExerciseResponse]


class RoutineResponse(BaseModel):
    id: str
    name: str
    description: str | None
    is_active: bool
    days: list[RoutineDayResponse]
    
    

class RoutineExerciseCreate(BaseModel):
    exercise_id: str
    exercise_order: int = Field(ge=1)
    sets: int | None = Field(default=None, ge=1)
    reps: int | None = Field(default=None, ge=1)
    notes: str | None = None


class RoutineDayCreate(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    name: str | None = None
    is_rest_day: bool = False
    exercises: list[RoutineExerciseCreate] = []


class RoutineCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    days: list[RoutineDayCreate] = Field(default_factory=list)
    
    
    
    
