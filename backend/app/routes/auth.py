from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from ..database import get_db
from ..auth import authenticate_user, create_access_token, get_current_user, get_settings
from ..models import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    settings = get_settings()
    from datetime import timedelta
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)

    role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)

    access_token = create_access_token(
        data={"sub": user.username, "role": role_value}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current logged-in user info"""
    return {
        "username": current_user.username,
        "role": current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "is_active": current_user.is_active
    }
