# thema_typescrypt

TypeScript フロントエンドと Python バックエンドを同居させるモノレポの初期基盤です。

## 構成

- `frontend`: Vite + React + TypeScript
- `backend`: FastAPI + SQLAlchemy + SQLite

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
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 型生成フロー

1. バックエンドの OpenAPI スキーマを出力
2. `openapi-typescript` で TypeScript 型を更新

```bash
pnpm api:export
pnpm api:generate
```

## 開発用コマンド

- `pnpm dev:frontend`: フロントエンド起動
- `pnpm dev:backend`: バックエンド起動
- `pnpm api:export`: OpenAPI スキーマを `frontend/openapi/schema.json` に出力
- `pnpm api:generate`: OpenAPI から TypeScript 型を生成
- `pnpm test:frontend`: フロントエンドテスト
- `pnpm test:backend`: バックエンドテスト

## 主要エンドポイント

- `GET /health`
- `GET /api/items`
- `POST /api/items`

## 開発用認証

ルートの `.env` に初期ログイン用ユーザーを定義できます。

```bash
THEMA_DEV_USERNAME=admin
THEMA_DEV_PASSWORD=password123
THEMA_DEV_DISPLAY_NAME=Developer Admin
```

初回起動時にこのユーザーが SQLite に投入されます。追加ユーザーは UI または `POST /api/auth/register` から登録できます。
