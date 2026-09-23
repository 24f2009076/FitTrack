from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.schemas.coach import CoachChatResponse, CoachChatRequest, CoachConversationSummary, CoachMessageResponse, CoachConversationMessagesResponse
from app.routers.auth import get_current_user
from app.database import get_db
from app.models.routine import Routine, RoutineDay, RoutineExercise
from app.models.coach import CoachConversation, CoachMessage
from app.service.coach_service import build_coach_prompt, get_coach_response, get_recent_workout_context, get_active_routine_context, save_coach_message, get_recent_conversation_context, get_user_conversation, create_conversation


router = APIRouter(
    prefix="/api/coach",
    tags=["coach"]
)


@router.post("/chat", response_model=CoachChatResponse)
def chat_with_coach(
    payload: CoachChatRequest,
    isActive: bool = False,
    current_user=Depends(get_current_user),
    db: Session=Depends(get_db)
):
    user_id = current_user.id
    
    

    # -----------------------------
    # 1. Get or create conversation
    # -----------------------------

    if payload.conversation_id:

        conversation = get_user_conversation(
            db=db,
            conversation_id=payload.conversation_id,
            user_id=user_id
        )

        # if not conversation:
        #     raise HTTPException(
        #         status_code=404,
        #         detail="Conversation not found"
        #     )

    else:

        conversation = create_conversation(
            db=db,
            user_id=user_id,
            first_message=payload.message
        )

    # -----------------------------
    # 2. Get OLD conversation context
    # -----------------------------

    conversation_context = get_recent_conversation_context(
        db=db,
        conversation_id=conversation.id
    )

    # -----------------------------
    # 3. Save user's new message
    # -----------------------------

    save_coach_message(
        db=db,
        conversation_id=conversation.id,
        role="user",
        content=payload.message
    )

    # -----------------------------
    # 4. Get FitTrack context
    # -----------------------------

    routine_context = get_active_routine_context(
        db,
        user_id
    )

    workout_context = get_recent_workout_context(
        db,
        user_id
    )

    # -----------------------------
    # 5. Build prompt
    # -----------------------------

    prompt = build_coach_prompt(
        question=payload.message,
        routine_context=routine_context,
        workout_context=workout_context,
        conversation_context=conversation_context
    )

    # -----------------------------
    # 6. Ask Gemini
    # -----------------------------
    if isActive:
        coach_response = get_coach_response(prompt)
    else:
        coach_response = "This is Sample response from Fittrack Coach. The API KEY is currently inactive. Please activate the API key to get real responses from Fittrack Coach."

    # -----------------------------
    # 7. Save Gemini response
    # -----------------------------

    save_coach_message(
        db=db,
        conversation_id=conversation.id,
        role="assistant",
        content=coach_response
    )

    # -----------------------------
    # 8. Return response
    # -----------------------------

    return CoachChatResponse(
        message=coach_response,
        conversation_id=conversation.id
    )
    
 
 

@router.get(
    "/conversations",
    response_model=list[CoachConversationSummary]
)
def get_conversations(
    current_user=Depends(get_current_user),
    db: Session=Depends(get_db)
):
    user_id = current_user.id

    conversations = (
        db.query(CoachConversation)
        .filter(
            CoachConversation.user_id == user_id,
            CoachConversation.is_deleted == False
        )
        .order_by(CoachConversation.updated_at.desc())
        .all()
    )

    return conversations


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=CoachConversationMessagesResponse
)
def get_conversation_messages(
    conversation_id: str,
    current_user=Depends(get_current_user),
    db: Session=Depends(get_db)
):
    user_id = current_user.id

    conversation = (
        db.query(CoachConversation)
        .filter(
            CoachConversation.id == conversation_id,
            CoachConversation.user_id == user_id,
            CoachConversation.is_deleted == False
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    messages = (
        db.query(CoachMessage)
        .filter(
            CoachMessage.conversation_id == conversation_id
        )
        .order_by(CoachMessage.created_at.asc())
        .all()
    )

    return CoachConversationMessagesResponse(
        conversation_id=conversation.id,
        title=conversation.title,
        messages=messages
    )
 
 
 
 
 
 
 
 
 
 
    
    
