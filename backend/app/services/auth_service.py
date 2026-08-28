from sqlalchemy import select
from sqlalchemy.orm import Session
from app.security.jwt import create_access_token
from app.security.password import verify_password

from app.models.user import User
from app.schemas.auth import UserRegister
from app.security.password import hash_password


def register_user(db: Session, user_data: UserRegister) -> User:
    existing_user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    if existing_user:
        raise ValueError("Email already registered")

    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def login_user(db: Session, email: str, password: str) -> str:
    user = db.scalar(
        select(User).where(User.email == email)
    )

    if not user:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")

    return create_access_token(str(user.id))