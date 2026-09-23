from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class CoachChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class CoachChatResponse(BaseModel):
    conversation_id: Optional[str]
    message: str



class CoachConversationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str | None
    updated_at: datetime


class CoachMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: str
    content: str
    created_at: datetime
    
class CoachConversationMessagesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    conversation_id: str
    title: str | None
    messages: list[CoachMessageResponse]





