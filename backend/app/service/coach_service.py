from sqlalchemy.orm import Session, joinedload

from app.models.user import Profile
from app.models.routine import Routine, RoutineDay, RoutineExercise
from app.models.workout import WorkoutSession, WorkoutSessionExercise
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
    user_context: str
) -> str:

    return f"""
        You are FitTrack Coach, an AI fitness assistant inside the FitTrack app.

        Your job is to give useful, practical fitness guidance using the user's
        actual workout routine and workout history when relevant.
        
        USER INFORMATION:
        {user_context}

        USER'S ACTIVE ROUTINE:
        {routine_context}

        USER'S RECENT WORKOUT HISTORY:
        {workout_context}

        USER'S QUESTION:
        {question}

        INSTRUCTIONS:
        - Personalize your response using the workout information above.
        - Do not invent workout data that is not provided.
        - If the workout data is not relevant to the question, answer using general fitness knowledge.
        - Clearly distinguish between what you observe in the user's workout data and general advice.
        - Do not diagnose injuries or medical conditions.
        - For pain or injury questions, give conservative training advice and recommend professional medical evaluation when appropriate.
        - Keep responses practical and easy to understand.
"""







