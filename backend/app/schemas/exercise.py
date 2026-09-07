from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Literal


VALID_MUSCLES = {
    "Chest",
    "Back",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Forearms",
    "Quadriceps",
    "Hamstrings",
    "Glutes",
    "Calves",
    "Core",
}

VALID_EQUIPMENT = {
    "Barbell",
    "Dumbbell",
    "Cable",
    "Machine",
    "Smith Machine",
    "Kettlebell",
    "Resistance Band",
    "Bodyweight",
    "EZ Bar",
    "Trap Bar",
    "Other",
}

TrackingType = Literal[
    "reps",
    "reps_weight",
    "duration",
    "duration_weight",
]

class ExerciseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    primary_muscle: str | None = None
    equipment: str | None = None
    tracking_type: TrackingType = "reps_weight"

    @field_validator("primary_muscle")
    @classmethod
    def validate_primary_muscle(cls, value):
        if value is not None and value not in VALID_MUSCLES:
            raise ValueError(
                f"Invalid muscle. Must be one of: {', '.join(sorted(VALID_MUSCLES))}"
            )
        return value

    @field_validator("equipment")
    @classmethod
    def validate_equipment(cls, value):
        if value is not None and value not in VALID_EQUIPMENT:
            raise ValueError(
                f"Invalid equipment. Must be one of: {', '.join(sorted(VALID_EQUIPMENT))}"
            )
        return value

class ExerciseBulkCreate(BaseModel):
    exercises: list[ExerciseCreate] = Field(min_length=1)


class ExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None
    primary_muscle: str | None
    tracking_type: TrackingType
    equipment: str | None
    created_by: str | None
    is_deleted: bool