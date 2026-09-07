from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.auth import AuthRequest, AuthResponse, ProfileResponse
from app.database import get_db
from app.auth import get_current_user
from app.routers.auth import router as auth_router
from app.routers.routines import router as routines_router
from app.routers.exercises import router as exercises_router

app = FastAPI(
    title="FitTrack API",
    description="Backend API for FitTrack, a fitness tracking application.",
    version="1.0.0"
)
app.include_router(auth_router)
app.include_router(routines_router)
app.include_router(exercises_router)

@app.get("/")
def root():
    return {"message": "Welcome to the FitTrack API!"}


@app.get("/db-test")
def database_test(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    
    return {
        "database": "connected",
        "result": result.scalar()
    }
    



# TEST ENDPOINTS FOR MODELS
from app.models.user import Profile
from app.models.exercise import Exercise
from app.models.routine import Routine


# @app.get("/profile-test")
# def profile_test(db: Session = Depends(get_db)):
#     profile = db.query(Profile).first()

#     if profile is None:
#         return {"profile": None}

#     return {
#         "id": profile.id,
#         "display_name": profile.display_name,
#         "avatar_url": profile.avatar_url,
#         "level": profile.level
#     }

# @app.get("/exercise-test")
# def exercise_test(db: Session = Depends(get_db)):
#     exercises = db.query(Exercise).limit(5).all()

#     return [
#         {
#             "id": exercise.id,
#             "name": exercise.name,
#             "primary_muscle": exercise.primary_muscle,
#             "equipment": exercise.equipment
#         }
#         for exercise in exercises
#     ]
    
# @app.get("/routine-test")
# def routine_test(db: Session = Depends(get_db)):
#     routines = db.query(Routine).limit(5).all()

#     return [
#         {
#             "id": routine.id,
#             "name": routine.name,
#             "description": routine.description
#         }
#         for routine in routines
#     ]


# @app.get("/auth-test")
# def auth_test(current_user=Depends(get_current_user)):
#     return {
#         "authenticated": True,
#         "user_id": str(current_user.id),
#         "email": current_user.email
#     }
    

# @app.get('/api/auth/me', response_model=ProfileResponse)
# def get_me(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    
#     profile = db.query(Profile).filter(
#         Profile.user_id == current_user.id
#     ).first()
    
#     if profile is None:
#         raise HTTPException(
#             status_code=404,
#             detail="Profile not found"
#         )
    
#     return profile





