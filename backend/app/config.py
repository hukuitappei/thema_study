import os
from pathlib import Path


def load_env_file() -> None:
    env_path = BASE_DIR.parent / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", maxsplit=1)
        os.environ.setdefault(key.strip(), value.strip())


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
load_env_file()
DATABASE_URL = os.getenv("THEMA_DATABASE_URL", f"sqlite:///{DATA_DIR / 'app.db'}")
APP_NAME = "thema-backend"
APP_VERSION = "0.1.0"
DEV_USERNAME = os.getenv("THEMA_DEV_USERNAME", "admin")
DEV_PASSWORD = os.getenv("THEMA_DEV_PASSWORD", "password123")
DEV_DISPLAY_NAME = os.getenv("THEMA_DEV_DISPLAY_NAME", "Developer Admin")
ACCESS_TOKEN_TTL_HOURS = 24
