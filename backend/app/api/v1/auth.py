from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.schemas.auth import UserLogin, UserRegister, UserResponse
from app.services.auth_service import login_user, register_user
from app.models.user import User


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    try:
        user = register_user(db, user_data)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
    )

@router.post("/login")
def login(
    user_data: UserLogin,
    response: Response,
    db: Session = Depends(get_db),
):
    try:
        access_token = login_user(
            db,
            user_data.email,
            user_data.password,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
        )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=30 * 60,
    )

    return {"message": "Login successful"}

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
    )

    return {"message": "Logout successful"}