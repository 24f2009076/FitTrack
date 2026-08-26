from app.database import SessionLocal
from app.service.exercise import bulk_create_exercises
from seeds.exercise import EXERCISES


from app.schemas.exercise import ExerciseCreate


def seed_exercises():
    db = SessionLocal()

    try:
        exercises = [
            ExerciseCreate(**exercise)
            for exercise in EXERCISES
        ]

        created = bulk_create_exercises(
            db=db,
            exercises=exercises,
        )

        print(f"Created {len(created)} exercises.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_exercises()