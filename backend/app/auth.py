from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import ACCESS_TOKEN_TTL_HOURS
from app.database import get_db
from app.models import AuthToken, User
from app.security import hash_password, issue_token, verify_password
from app.schemas import LoginRequest, LoginResponse, RegisterRequest, UserProfile

bearer_scheme = HTTPBearer(auto_error=False)


def login(payload: LoginRequest, db: Session) -> LoginResponse:
    user = db.query(User).filter(User.username == payload.username).one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token_value = issue_token()
    expires_at = datetime.now(UTC) + timedelta(hours=ACCESS_TOKEN_TTL_HOURS)
    token = AuthToken(token=token_value, user_id=user.id, expires_at=expires_at)
    db.add(token)
    db.commit()

    return LoginResponse(
        access_token=token_value,
        token_type="bearer",
        user=UserProfile(username=user.username, display_name=user.display_name),
    )


def register(payload: RegisterRequest, db: Session) -> UserProfile:
    existing = db.query(User).filter(User.username == payload.username).one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    user = User(
        username=payload.username,
        display_name=payload.display_name,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserProfile(username=user.username, display_name=user.display_name)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> UserProfile:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = (
        db.query(AuthToken)
        .filter(AuthToken.token == credentials.credentials)
        .one_or_none()
    )
    now = datetime.now(UTC)
    if token is None or token.expires_at.replace(tzinfo=UTC) <= now:
        if token is not None:
            db.delete(token)
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user = db.get(User, token.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    return UserProfile(username=user.username, display_name=user.display_name)
