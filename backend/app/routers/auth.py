from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.supabase import supabase
from app.schemas.auth import AuthRequest, AuthResponse, ProfileResponse, ProfileUpdate
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
        existing_profile = db.get(
            Profile,
            str(response.user.id)
        )
        
        if existing_profile is None:
            profile = Profile(
                id=str(response.user.id)
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
        
        
        
        
@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.get(
        Profile,
        str(current_user.id)
    )
    
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return profile



@router.patch("/profile", response_model=ProfileResponse)
def update_profile(
    data: ProfileUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.get(
        Profile,
        str(current_user.id)
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(profile, field, value)

    try:
        db.commit()
        db.refresh(profile)

        return profile

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/profile_pic")
async def upload_profile_pic(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    allowed_types = {
    "image/jpeg",
    "image/png",
}
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG and PNG are allowed."
        )
    
    contents = await file.read()
    
    extension_map = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    }
    
    extension = extension_map[file.content_type]
    
    file_path = (
        f"{current_user.id}/{uuid4()}.{extension}"
    )
    
    try:
        supabase.storage.from_("profile_pics").upload(
            path=file_path,
            file=contents,
            file_options={
                "content-type": file.content_type,
                "upsert": False
            }
        )
        public_url = (
            supabase.storage
            .from_("profile_pics")
            .get_public_url(file_path)
        )
        
        return {
            "path": file_path,
            "public_url": public_url
        }
    
    except Exception as e:
        print(f"Error uploading profile picture: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload profile picture: {str(e)}"
        )