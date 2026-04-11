import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { components } from "../generated/schema";

type ItemCreate = components["schemas"]["ItemCreate"];
type UserProfile = components["schemas"]["UserProfile"];

type ItemEditorPanelProps = {
  editingId: number | null;
  form: ItemCreate;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  itemError: string | null;
  itemNotice: string | null;
  resetForm: () => void;
  setForm: Dispatch<SetStateAction<ItemCreate>>;
  setTagInput: Dispatch<SetStateAction<string>>;
  submitting: boolean;
  tagInput: string;
  user: UserProfile | null;
};

export function ItemEditorPanel({
  editingId,
  form,
  handleSubmit,
  itemError,
  itemNotice,
  resetForm,
  setForm,
  setTagInput,
  submitting,
  tagInput,
  user,
}: ItemEditorPanelProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{editingId === null ? "アイテム追加" : "アイテム編集"}</h2>
        {editingId !== null ? (
          <button className="ghost-button" onClick={resetForm} type="button">
            キャンセル
          </button>
        ) : null}
      </header>
      {user ? (
        <form className="item-form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>タイトル</span>
            <input
              aria-label="タイトル"
              maxLength={120}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="例: API contract を更新する"
            />
          </label>
          <label>
            <span>説明</span>
            <textarea
              aria-label="説明"
              rows={4}
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="背景や対応内容をメモする"
            />
          </label>
          <label>
            <span>タグ</span>
            <input
              aria-label="タグ"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="例: api, fastapi, auth"
            />
          </label>
          {itemError ? (
            <p className="error" role="alert">
              {itemError}
            </p>
          ) : null}
          {itemNotice ? (
            <p className="notice" role="status">
              {itemNotice}
            </p>
          ) : null}
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "送信中..." : editingId === null ? "追加する" : "更新する"}
          </button>
        </form>
      ) : (
        <p>アイテムの追加・編集・削除にはログインが必要です。</p>
      )}
    </section>
  );
}
