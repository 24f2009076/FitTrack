from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.user import Profile
from app.models.routine import Routine, RoutineDay, RoutineExercise
from app.models.workout import WorkoutSession, WorkoutSessionExercise
from app.models.coach import CoachConversation, CoachMessage
import os

from google import genai
from dotenv import load_dotenv


load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def get_coach_response(prompt: str) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        if not response.text:
            return "I couldn't generate a response right now."

        return response.text

    except Exception as e:
        print(f"Gemini error: {e}")
        return "I'm having trouble responding right now. Please try again."


def get_user_context(
    db: Session,
    user_id: str
) -> str:
    
    profile = db.get(
        Profile, 
        str(user_id))
    
    if not profile:
        return "The user has no profile information available."
    
    context = "User Profile Information:\n"
    context += f"Height: {profile.height_cm} cm\n"
    context += f"Weight: {profile.weight_kg} kg\n"
    context += f"Level: {profile.level}\n"
    context += f"Goal: {profile.goal}\n"

    return context

def get_active_routine_context(
    db: Session,
    user_id: str
) -> str:

    active_routine = (
        db.query(Routine)
        .options(
            joinedload(Routine.days)
            .joinedload(RoutineDay.exercises)
            .joinedload(RoutineExercise.exercise)
        )
        .filter(
            Routine.user_id == user_id,
            Routine.is_active == True,
            Routine.is_deleted == False
        )
        .first()
    )

    if not active_routine:
        return "The user currently has no active routine."

    context = f"Active Routine: {active_routine.name}\n"

    for day in active_routine.days:

        context += f"\nDay {day.day_of_week}: "

        if day.is_rest_day:
            context += "Rest Day\n"
            continue

        context += f"{day.name or 'Workout'}\n"

        for routine_exercise in day.exercises:
            exercise = routine_exercise.exercise

            context += (
                f"- {exercise.name}"
                f" | {routine_exercise.planned_sets} sets"
            )

            if routine_exercise.planned_reps is not None:
                context += (
                    f" x {routine_exercise.planned_reps} reps"
                )

            if routine_exercise.planned_duration_seconds is not None:
                context += (
                    f" x {routine_exercise.planned_duration_seconds}s"
                )

            context += "\n"

    return context



def get_recent_workout_context(
    db: Session,
    user_id: str,
    limit: int = 5
) -> str:

    sessions = (
        db.query(WorkoutSession)
        .options(
            joinedload(WorkoutSession.session_exercises)
            .joinedload(WorkoutSessionExercise.sets)
        )
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "completed",
            WorkoutSession.is_deleted == False
        )
        .order_by(WorkoutSession.completed_at.desc())
        .limit(limit)
        .all()
    )

    if not sessions:
        return "The user has no completed workout sessions yet."

    context = ""

    for session in sessions:

        context += (
            f"\nWorkout completed: "
            f"{session.completed_at}\n"
        )

        session_exercises = sorted(
            session.session_exercises,
            key=lambda x: x.exercise_order
        )

        for session_exercise in session_exercises:

            context += (
                f"- {session_exercise.exercise_name}"
                f" ({session_exercise.tracking_type})\n"
            )

            workout_sets = sorted(
                session_exercise.sets,
                key=lambda x: x.set_number
            )

            for workout_set in workout_sets:

                context += f"  Set {workout_set.set_number}:"

                if workout_set.weight_kg is not None:
                    context += f" {workout_set.weight_kg} kg"

                if workout_set.reps is not None:
                    context += f" x {workout_set.reps} reps"

                if workout_set.duration_seconds is not None:
                    context += (
                        f" x {workout_set.duration_seconds} sec"
                    )

                context += "\n"

    return context



def build_coach_prompt(
    question: str,
    routine_context: str,
    workout_context: str,
    conversation_context: str,
) -> str:

    return f"""
            You are FitTrack Coach, an AI fitness assistant inside the FitTrack app.

            Your job is to give practical and personalized fitness guidance using
            the user's workout data when relevant.

            USER'S ACTIVE ROUTINE:
            {routine_context}

            USER'S RECENT WORKOUT HISTORY:
            {workout_context}

            RECENT CONVERSATION:
            {conversation_context}

            CURRENT USER MESSAGE:
            {question}

            INSTRUCTIONS:
            - Use the user's workout data when it is relevant.
            - Use the conversation history to understand follow-up questions.
            - Do not invent workout data that has not been provided.
            - Clearly distinguish observations from general fitness advice.
            - Do not diagnose injuries or medical conditions.
            - For pain or injury questions, give conservative advice and recommend
            professional medical evaluation when appropriate.
            - Keep responses practical and easy to understand.
"""





def create_conversation(
    db: Session,
    user_id: str,
    first_message: str
) -> CoachConversation:

    # Simple temporary title.
    # Later Gemini can generate prettier titles.
    title = first_message[:60]

    conversation = CoachConversation(
        user_id=user_id,
        title=title
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def get_user_conversation(
    db: Session,
    conversation_id: str,
    user_id: str
) -> CoachConversation | None:

    return (
        db.query(CoachConversation)
        .filter(
            CoachConversation.id == conversation_id,
            CoachConversation.user_id == user_id,
            CoachConversation.is_deleted == False
        )
        .first()
    )


def save_coach_message(
    db: Session,
    conversation_id: str,
    role: str,
    content: str
) -> CoachMessage:

    message = CoachMessage(
        conversation_id=conversation_id,
        role=role,
        content=content
    )

    db.add(message)

    conversation = (
        db.query(CoachConversation)
        .filter(
            CoachConversation.id == conversation_id
        )
        .first()
    )

    if conversation:
        conversation.updated_at = func.now()

    db.commit()
    db.refresh(message)

    return message

def get_recent_conversation_context(
    db: Session,
    conversation_id: str,
    limit: int = 10
) -> str:

    messages = (
        db.query(CoachMessage)
        .filter(
            CoachMessage.conversation_id == conversation_id
        )
        .order_by(CoachMessage.created_at.desc())
        .limit(limit)
        .all()
    )

    messages.reverse()

    if not messages:
        return "No previous conversation."

    context = ""

    for message in messages:

        speaker = (
            "User"
            if message.role == "user"
            else "Coach"
        )

        context += (
            f"{speaker}: "
            f"{message.content}\n"
        )

    return context









