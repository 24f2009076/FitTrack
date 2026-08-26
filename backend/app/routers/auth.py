from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.supabase import supabase
from app.schemas.auth import AuthRequest, AuthResponse
from app.database import get_db
from app.models.user import Profile


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

security = HTTPBearer()


@router.post("/signup", response_model=AuthResponse)
def signup(data: AuthRequest, db: Session = Depends(get_db)):

    try:
        # 1. Create the Supabase Auth user
        response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })

        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to create user"
            )

        if response.session is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User created, but no session was returned."
            )

        # 2. Create the FitTrack profile
        profile = Profile(
            id=str(response.user.id),
            level="Beginner"
        )

        db.add(profile)
        db.commit()

        # 3. Return authentication information
        return AuthResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user_id=str(response.user.id),
            email=response.user.email
        )

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        

@router.post("/login", response_model=AuthResponse)
def login(data: AuthRequest):

    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

        if response.user is None or response.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        return AuthResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user_id=str(response.user.id),
            email=response.user.email
        )

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    access_token = credentials.credentials
    
    try:
        response = supabase.auth.get_user(access_token)
        
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token"
            )
        
        return response.user
    
    except HTTPException:
        raise
    
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )
        