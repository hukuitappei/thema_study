# thema_typescrypt

認証付きのタグ付きアイテム管理アプリです。TODO 管理アプリの土台として使える、React + TypeScript frontend と FastAPI backend のフルスタック MVP です。

## Project Status

MVP 完了扱いです。必須の未実装項目はありません。

詳細は [docs/remaining-tasks.md](docs/remaining-tasks.md) にまとめています。

## Structure

- `frontend`: Vite + React + TypeScript
- `backend`: FastAPI + SQLAlchemy + SQLite + Alembic

## Main Features

- ユーザー登録、ログイン、セッション復元
- プロフィール更新、パスワード変更
- アイテムの作成、一覧、編集、削除
- アイテム所有者だけが編集・削除できる権限制御
- タグ付け、タグ一覧、タグフィルタ、タグ並び替え
- OpenAPI schema から frontend TypeScript 型を生成

## Setup

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e .[dev]
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Development Commands

Root scripts are kept for pnpm workspaces:

```bash
pnpm dev:frontend
pnpm dev:backend
pnpm test:frontend
pnpm test:backend
pnpm db:migrate
pnpm api:export
pnpm api:generate
```

This workspace also has npm dependencies under `frontend`, so frontend tests can be run directly:

```bash
cd frontend
npm test -- --run
```

Backend tests can be run directly:

```bash
cd backend
pytest
```

## OpenAPI

Export the backend OpenAPI schema and regenerate frontend types:

```bash
pnpm api:export
pnpm api:generate
```

Generated frontend types are stored in `frontend/src/generated/schema.ts`.

## API Endpoints

- `GET /health`
- `GET /api/items`
- `POST /api/items`
- `PUT /api/items/{item_id}`
- `DELETE /api/items/{item_id}`
- `GET /api/tags`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `POST /api/auth/change-password`

## Environment

Set these values in `.env` to create the development seed user:

```env
THEMA_DEV_USERNAME=admin
THEMA_DEV_PASSWORD=password123
THEMA_DEV_DISPLAY_NAME=Developer Admin
THEMA_DATABASE_URL=sqlite:///backend/data/app.db
```

## Known Constraint

In this OneDrive workspace, `frontend` production builds can fail with `spawn EPERM` while Vite/esbuild loads the config. This is treated as an environment constraint, not an application implementation gap. Use a non-OneDrive working copy for production build verification.
