# Project Completion Notes

このリポジトリは、認証付きのタグ付きアイテム管理アプリとして MVP 完了扱いです。

## Completed

- FastAPI backend with SQLite, SQLAlchemy, and Alembic migrations.
- React + TypeScript frontend built with Vite.
- Authentication flows:
  - login
  - registration
  - session restore
  - profile update
  - password change
- Item management:
  - list items
  - create item
  - update item
  - delete item
  - restrict update/delete to the item owner
- Tag features:
  - add tags to items
  - normalize duplicate tag input
  - list tag summaries with usage counts
  - filter items by tag
  - sort and expand the tag list in the UI
- OpenAPI workflow:
  - export backend OpenAPI schema
  - generate frontend TypeScript types from the schema
- UI copy is centralized in `frontend/src/lib/ui-copy.ts`.
- Frontend and backend tests cover the main flows.

## Remaining

- No required implementation tasks remain for the MVP scope.

## Known Constraints

- In the current OneDrive workspace, `frontend` production builds can fail with `spawn EPERM` while Vite/esbuild loads the config.
- TypeScript compilation and the automated frontend/backend tests pass in this workspace.
- Build verification should be done from a non-OneDrive working copy when a production artifact is needed.

## Optional Follow-ups

- Add dedicated todo fields such as completion status, due date, or priority if the app should become a stricter todo manager.
- Add richer item detail views if descriptions become longer.
- Add deployment configuration once a hosting target is decided.
