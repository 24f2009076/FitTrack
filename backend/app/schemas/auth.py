from pydantic import BaseModel, EmailStr

class AuthRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    email: str

class ProfileResponse(BaseModel):
    id: str
    display_name: str
    avatar_url: str
    level: int