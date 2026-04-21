# Remaining Tasks

現時点の整理結果と、次に進める候補をまとめたメモです。

## Completed

- `GET /api/tags` を使ったタグフィルタ導線は実装済みです。
- タグ一覧は上位表示、展開、選択中タグの補完、並び順切替に対応済みです。
- 認証ロジックは `session`、`forms`、`account` の責務に整理済みです。
- `App.tsx` は layout 寄りに整理し、hero を独立コンポーネントへ分離済みです。
- `ItemSection` は `status` / `editor` / `list` に整理し、`ItemListPanel` も controls / pagination / card list に分割済みです。
- UI 文言は `frontend/src/lib/ui-copy.ts` に集約を進め、主要テストも同じ定数参照へ寄せています。
- migration 追加時に更新すべき README と確認箇所を文書化済みです。
- `frontend` の build は `C:\Users\btsi1\デスクトップ\cursor\thema_typescrypt_buildcheck` で成功確認済みです。

## Remaining

- 現時点の残タスクはありません。主要 UI 文言は `frontend/src/lib/ui-copy.ts` に集約済みで、`useItemsController` は分割済み hook の返却形を型で固定しています。

## Known Constraints

- `frontend` の `npm run build` は、OneDrive 配下の作業フォルダでは Vite / esbuild の実パス解決中に `spawn EPERM` で失敗します。
- 同一コードを OneDrive 外の `C:\Users\btsi1\デスクトップ\cursor\thema_typescrypt_buildcheck` に配置すると build は通るため、現状はコード不具合ではなく環境依存です。
- `frontend` のテストと `backend` のテストは現作業フォルダでも通過しています。

## Suggested Follow-ups

- `ItemSection` がさらに大きくなるなら、表示専用セクションを追加で分離する。
- UI 文言整理の進め方を再利用できる Skill として `~/.codex/skills` 配下へ切り出す。
- UI 文言をまとめる薄いヘルパーを入れて、表示文言の差し替えを追いやすくする。
- build 検証は引き続き `C:\Users\btsi1\デスクトップ\cursor\thema_typescrypt_buildcheck` を検証用ワークツリーとして使う。
