from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.auth import AuthRequest, AuthResponse, ProfileResponse
from app.database import get_db
from app.auth import get_current_user
from app.routers.auth import router as auth_router
from app.routers.routines import router as routines_router
from app.routers.exercises import router as exercises_router
from app.routers.workout import router as workout_router
from app.routers.progress import router as progress_router
from app.routers.coach import router as coach_router
from app.routers.home import router as home_router

app = FastAPI(
    title="FitTrack API",
    description="Backend API for FitTrack, a fitness tracking application.",
    version="1.0.0"
)
app.include_router(auth_router)
app.include_router(routines_router)
app.include_router(exercises_router)
app.include_router(workout_router)
app.include_router(progress_router)
app.include_router(coach_router)
app.include_router(home_router)

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
    





