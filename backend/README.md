# Backend

FastAPI + SQLAlchemy + SQLite + Alembic で構成されたバックエンドです。認証付きのアイテム管理 API を提供します。

## セットアップ

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -e .[dev]
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 環境変数

`.env` に seed user と DB URL を設定します。

```env
THEMA_DEV_USERNAME=admin
THEMA_DEV_PASSWORD=password123
THEMA_DEV_DISPLAY_NAME=Developer Admin
THEMA_DATABASE_URL=sqlite:///backend/data/app.db
```

## 日常コマンド

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pytest
python -m alembic upgrade head
python -m alembic revision --autogenerate -m "describe change"
python scripts/export_openapi.py
```

## Alembic 運用

スキーマ変更は Alembic migration で管理します。

1. models / CRUD / schema の変更を入れる
2. `python -m alembic revision --autogenerate -m "describe change"` で migration を生成する
3. `backend/alembic/versions/` に作られたファイルを確認する
4. `python -m alembic upgrade head` で適用する
5. migration 一覧が増えたらこの README も更新する

### migration が必要な変更

- テーブルの追加・削除
- カラム、index、constraint の変更
- 永続化スキーマに影響する relationship の変更

DB スキーマが変わらない API や UI の変更だけであれば migration は不要です。

### レビュー時の確認項目

- `revision` と `down_revision` が既存チェーンにつながっている
- `upgrade()` と `downgrade()` が対応している
- index、unique、foreign key が意図どおりに入っている
- nullable や default が実データ要件と一致している

### 現在の migration

- `20260403_0001_initial_schema.py`: `users`、`items`、`auth_tokens` を作成
- `20260403_0002_add_tags.py`: `tags`、`item_tags` を作成

## API

### Health

- `GET /health`

### Items

- `GET /api/items`
- `POST /api/items`
- `PUT /api/items/{item_id}`
- `DELETE /api/items/{item_id}`

### Tags

- `GET /api/tags`

タグ名と使用件数の要約を返し、フロントエンドのタグフィルタに使います。

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `POST /api/auth/change-password`

## 補足

- アイテムの更新・削除は所有者のみ可能です。
- 認証が必要な API は Bearer トークンを使用します。
- OpenAPI は `python scripts/export_openapi.py` で出力できます。
