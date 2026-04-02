from sqlalchemy.orm import Session

from app.config import DEV_DISPLAY_NAME, DEV_PASSWORD, DEV_USERNAME
from app.models import User
from app.security import hash_password


def ensure_seed_data(db: Session) -> None:
    existing = db.query(User).filter(User.username == DEV_USERNAME).one_or_none()
    if existing is not None:
        return

    user = User(
        username=DEV_USERNAME,
        display_name=DEV_DISPLAY_NAME,
        password_hash=hash_password(DEV_PASSWORD),
    )
    db.add(user)
    db.commit()
