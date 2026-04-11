# thema_typescrypt

TypeScript フロントエンドと Python バックエンドを組み合わせた、認証付きアイテム管理アプリです。

## 構成

- `frontend`: Vite + React + TypeScript
- `backend`: FastAPI + SQLAlchemy + SQLite + Alembic

## セットアップ

### フロントエンド

```bash
pnpm install
pnpm dev
```

### バックエンド

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e .[dev]
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## OpenAPI 生成

バックエンドの OpenAPI スキーマを出力し、フロントエンドの生成型を更新します。

```bash
pnpm api:export
pnpm api:generate
```

## マイグレーション運用

DB スキーマは Alembic で管理しています。

```bash
pnpm db:migrate
pnpm db:revision -- -m "add tags table"
```

DB に影響するモデルや CRUD を変更したら、次の順で更新します。

- `pnpm db:revision -- -m "..."`
- 生成された `backend/alembic/versions/` 配下の差分を確認
- `pnpm db:migrate` で適用
- migration 一覧が増えた場合は `backend/README.md` も更新

生成された revision は `revision` と `down_revision` で既存チェーンにつながる前提です。

## 開発用コマンド

- `pnpm dev:frontend`: フロントエンド起動
- `pnpm dev:backend`: バックエンド起動
- `pnpm test:frontend`: フロントエンドテスト
- `pnpm test:backend`: バックエンドテスト
- `pnpm db:migrate`: Alembic migration を適用
- `pnpm db:revision`: `--autogenerate` 付きで Alembic revision を作成
- `pnpm api:export`: OpenAPI を `frontend/openapi/schema.json` に出力
- `pnpm api:generate`: OpenAPI から TypeScript 型を生成

## 主なエンドポイント

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

## 開発用認証情報

ルートの `.env` に以下を設定すると、起動時に seed user を自動作成します。

```env
THEMA_DEV_USERNAME=admin
THEMA_DEV_PASSWORD=password123
THEMA_DEV_DISPLAY_NAME=Developer Admin
THEMA_DATABASE_URL=sqlite:///backend/data/app.db
```

## 補足

- 既知制約と今後の候補は `docs/remaining-tasks.md` にまとめています。
