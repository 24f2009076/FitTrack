from pydantic import BaseModel
from typing import Optional


class CoachChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class CoachChatResponse(BaseModel):
    conversation_id: Optional[str]
    message: str


