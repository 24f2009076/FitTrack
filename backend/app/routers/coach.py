from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.schemas.coach import CoachChatResponse, CoachChatRequest
from app.routers.auth import get_current_user
from app.database import get_db
from app.models.routine import Routine, RoutineDay, RoutineExercise
from app.service.coach_service import build_coach_prompt, get_coach_response, get_recent_workout_context, get_active_routine_context, get_user_context


router = APIRouter(
    prefix="/api/coach",
    tags=["coach"]
)


@router.post("/chat", response_model=CoachChatResponse)
def chat_with_coach(
    payload: CoachChatRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user.id

    routine_context = get_active_routine_context(
        db,
        user_id
    )

    workout_context = get_recent_workout_context(
        db,
        user_id
    )
    
    user_context = get_user_context(
        db,
        user_id
    )
    
    prompt = build_coach_prompt(
        question=payload.message,
        user_context=user_context,
        routine_context=routine_context,
        workout_context=workout_context
    )


    return CoachChatResponse(
        message=get_coach_response(prompt),
        conversation_id=payload.conversation_id
    )