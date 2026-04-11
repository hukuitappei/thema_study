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

ルートの `.env` に開発用ユーザーと DB URL を設定します。

```env
THEMA_DEV_USERNAME=admin
THEMA_DEV_PASSWORD=password123
THEMA_DEV_DISPLAY_NAME=Developer Admin
THEMA_DATABASE_URL=sqlite:///backend/data/app.db
```

起動時に、このユーザーが存在しなければ自動作成されます。

## 日常コマンド

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pytest
python -m alembic upgrade head
python -m alembic revision --autogenerate -m "describe change"
python scripts/export_openapi.py
```

## Alembic 運用ルール

スキーマ変更は Alembic migration で管理します。

1. モデルや CRUD を変更したら、必要に応じて `python -m alembic revision --autogenerate` で migration を作成します。
2. 生成された migration はレビュー可能な差分になるように確認します。
3. ローカル開発では `python -m alembic upgrade head` で最新まで適用します。
4. アプリ起動時にも `head` まで自動適用されるため、起動時に未適用 migration があっても追従します。
5. スキーマ変更の手順や注意点は、この README と migration ファイルの両方に残します。

### migration を作るタイミング

- テーブル追加、カラム追加・削除、制約や index の変更をしたときは migration を作成します。
- API や CRUD だけの変更で DB スキーマに差分がない場合は、新しい migration は不要です。
- `alembic revision --autogenerate` の結果が空に近い場合でも、意図した差分かどうかは必ず目視確認します。

### migration レビュー時の確認項目

- `revision` と `down_revision` が正しくつながっていること。
- `upgrade()` と `downgrade()` が対になっていて、作成物を戻せること。
- index、unique 制約、外部キーがモデル定義どおりに入っていること。
- 既存データに影響する変更では、データ移行や null 許容の扱いが明示されていること。

### 起動時自動適用の注意

- アプリ起動時にも migration は `head` まで自動適用されます。
- そのため、壊れた migration を main に入れると、ローカル起動時点で失敗します。
- スキーマ変更を含む PR では、少なくとも `python -m alembic upgrade head` と `pytest` の両方を通してから共有する運用が安全です。

### 現在の migration

- `20260403_0001_initial_schema.py`: users / items / auth_tokens の初期作成
- `20260403_0002_add_tags.py`: tags / item_tags の追加

## API

### Health

- `GET /health`

### Items

- `GET /api/items`
- `POST /api/items`
- `PUT /api/items/{item_id}`
- `DELETE /api/items/{item_id}`

`GET /api/items` は一覧取得専用です。タグ集計は別 API から取得します。

### Tags

- `GET /api/tags`

タグ一覧と各タグの使用件数を返します。フロントエンドはこの API を使ってタグフィルタを描画します。

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `POST /api/auth/change-password`

`POST /api/auth/change-password` は現在のパスワード確認後に変更を行います。成功時は 204 を返します。

## 補足

- アイテムの更新・削除は所有者のみ可能です。
- 認証が必要な API は Bearer トークンを使用します。
- OpenAPI スキーマは `python scripts/export_openapi.py` で出力できます。
