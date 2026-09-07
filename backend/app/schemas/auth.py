from pydantic import BaseModel
from typing import Literal

class AuthRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    email: str
    
    

LevelType = Literal[
    "Beginner",
    "Intermediate",
    "Advanced"
]

GoalType = Literal[
    "Build Muscle",
    "Lose Weight",
    "Improve Strength",
    "General Fitness"
]


class ProfileResponse(BaseModel):
    id: str
    username: str | None = None
    profile_pic_url: str | None = None

    level: LevelType | None = None
    goal: GoalType | None = None
    
    height_cm: float | None = None
    weight_kg: float | None = None
    
    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    username: str | None = None
    profile_pic_url: str | None = None

    level: LevelType | None = None
    goal: GoalType | None = None

    height_cm: float | None = None
    weight_kg: float | None = None
    
    