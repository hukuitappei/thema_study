# Remaining Tasks

現時点の整理結果と、まだ残している改善候補をまとめたメモです。

## Completed

- `GET /api/tags` を使ったタグフィルタ導線は実装済みです。
- タグ一覧は上位表示、展開、選択中タグの補完、並び順切替に対応済みです。
- 認証ロジックは `session`、`forms`、`account` の責務に整理済みです。
- `App.tsx` は layout 寄りに整理し、hero を独立コンポーネントへ分離済みです。
- migration 追加時にどこを更新するかを README 群へ明記済みです。

## Remaining

- 必要になったら hook 単位のテストを追加して controller 形状の退行を検知しやすくする。
- migration が増えたら `backend/README.md` の一覧を追随更新する。

## Known Constraints

- `frontend` の `npm run build` は、この OneDrive 配下の実行環境では Vite / esbuild の実パス解決中に `spawn EPERM` で失敗します。
- `frontend` のテストと `backend` のテストは通過しています。

## Suggested Follow-ups

- `ItemSection` が今後さらに大きくなるなら、表示専用セクションを追加で分離する。
- UI 文言をまとめる薄いヘルパーを入れて、表示文言の差し替えを追いやすくする。
