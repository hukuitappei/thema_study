from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.config import DEV_DISPLAY_NAME, DEV_PASSWORD, DEV_USERNAME
from app.database import engine
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


def run_migrations() -> None:
    alembic_ini_path = Path(__file__).resolve().parent.parent / "alembic.ini"
    config = Config(str(alembic_ini_path))
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())
    managed_tables = {"users", "items", "auth_tokens"}
    has_version_table = "alembic_version" in table_names
    has_existing_schema = bool(managed_tables & table_names)
    has_version_row = False

    if has_version_table:
        with engine.connect() as connection:
            version_row = connection.execute(
                text("SELECT version_num FROM alembic_version LIMIT 1")
            ).fetchone()
        has_version_row = version_row is not None

    if has_existing_schema and not has_version_row:
        command.stamp(config, "head")

    command.upgrade(config, "head")
