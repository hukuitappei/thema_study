# thema_typescrypt

TypeScript フロントエンドと Python バックエンドを組み合わせた、認証付きアイテム管理アプリです。

## 構成

- `frontend`: Vite + React + TypeScript
- `backend`: FastAPI + SQLAlchemy + SQLite + Alembic

## セットアップ

### 1. フロントエンド

```bash
pnpm install
pnpm dev
```

### 2. バックエンド

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e .[dev]
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## OpenAPI 生成フロー

1. バックエンドの OpenAPI スキーマを出力
2. `openapi-typescript` で TypeScript 型を更新

```bash
pnpm api:export
pnpm api:generate
```

## マイグレーション

現在の DB スキーマは Alembic で管理しています。

```bash
pnpm db:migrate
pnpm db:revision -- -m "add tags table"
```

アプリ起動時にも `head` まで自動適用されるため、ローカル開発では手動実行を忘れても起動時に追従します。

## 開発用コマンド

- `pnpm dev:frontend`: フロントエンド起動
- `pnpm dev:backend`: バックエンド起動
- `pnpm test:frontend`: フロントエンドテスト
- `pnpm test:backend`: バックエンドテスト
- `pnpm db:migrate`: Alembic migration を適用
- `pnpm api:export`: OpenAPI スキーマを `frontend/openapi/schema.json` に出力
- `pnpm api:generate`: OpenAPI から TypeScript 型を生成

## 主なエンドポイント

- `GET /health`
- `GET /api/items`
- `POST /api/items`
- `PUT /api/items/{item_id}`
- `DELETE /api/items/{item_id}`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `POST /api/auth/change-password`

## 開発用認証

ルートの `.env` に初期ログインユーザーを設定できます。

```bash
THEMA_DEV_USERNAME=admin
THEMA_DEV_PASSWORD=password123
THEMA_DEV_DISPLAY_NAME=Developer Admin
THEMA_DATABASE_URL=sqlite:///backend/data/app.db
```

起動時にこのユーザーが SQLite に存在しなければ自動作成されます。追加ユーザーは UI または `POST /api/auth/register` から登録できます。

## 残件

現時点の既知制約と次の拡張候補は `docs/remaining-tasks.md` にまとめています。
