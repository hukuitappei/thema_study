# Backend

FastAPI backend with SQLite persistence and token-based auth.

## Run

```bash
pip install -e .[dev]
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Environment

Create a root `.env` file to seed the initial admin user:

```env
THEMA_DEV_USERNAME=admin
THEMA_DEV_PASSWORD=password123
THEMA_DEV_DISPLAY_NAME=Developer Admin
```

## Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

