import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { components } from "../generated/schema";
import { uiCopy } from "../lib/ui-copy";

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
        <h2>
          {editingId === null
            ? uiCopy.items.editor.createHeading
            : uiCopy.items.editor.editHeading}
        </h2>
        {editingId !== null ? (
          <button className="ghost-button" onClick={resetForm} type="button">
            {uiCopy.items.editor.cancel}
          </button>
        ) : null}
      </header>
      {user ? (
        <form className="item-form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>{uiCopy.items.editor.title}</span>
            <input
              aria-label={uiCopy.items.editor.title}
              maxLength={120}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder={uiCopy.items.editor.titlePlaceholder}
            />
          </label>
          <label>
            <span>{uiCopy.items.editor.description}</span>
            <textarea
              aria-label={uiCopy.items.editor.description}
              rows={4}
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder={uiCopy.items.editor.descriptionPlaceholder}
            />
          </label>
          <label>
            <span>{uiCopy.items.editor.tags}</span>
            <input
              aria-label={uiCopy.items.editor.tags}
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder={uiCopy.items.editor.tagsPlaceholder}
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
            {submitting
              ? uiCopy.items.editor.submitting
              : editingId === null
                ? uiCopy.items.editor.createSubmit
                : uiCopy.items.editor.editSubmit}
          </button>
        </form>
      ) : (
        <p>{uiCopy.items.editor.authRequired}</p>
      )}
    </section>
  );
}
