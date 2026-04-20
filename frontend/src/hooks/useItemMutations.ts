import { useState, type FormEvent } from "react";
import type { components } from "../generated/schema";
import { apiClient } from "../lib/api";
import { uiCopy } from "../lib/ui-copy";

type Item = components["schemas"]["ItemRead"];
type ItemCreate = components["schemas"]["ItemCreate"];

type ItemEditorState = {
  editingId: number | null;
  resetForm: () => void;
  setItemError: (message: string | null) => void;
  startEdit: (item: Item) => void;
  validateSubmit: (event: FormEvent<HTMLFormElement>) => ItemCreate | null;
};

type UseItemMutationsParams = {
  editor: ItemEditorState;
  items: Item[];
  setItems: (items: Item[]) => void;
  setPageError: (message: string | null) => void;
  syncTagsWithItems: (items: Item[]) => void;
};

export function useItemMutations({
  editor,
  items,
  setItems,
  setPageError,
  syncTagsWithItems,
}: UseItemMutationsParams) {
  const [itemNotice, setItemNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const payload = editor.validateSubmit(event);
    if (!payload) {
      return;
    }

    try {
      setSubmitting(true);
      editor.setItemError(null);
      setPageError(null);

      let nextItems: Item[];
      if (editor.editingId === null) {
        const created = await apiClient.createItem(payload);
        nextItems = [created, ...items];
        setItemNotice(uiCopy.items.mutations.created);
      } else {
        const updated = await apiClient.updateItem(editor.editingId, payload);
        nextItems = items.map((item) => (item.id === updated.id ? updated : item));
        setItemNotice(uiCopy.items.mutations.updated);
      }

      setItems(nextItems);
      syncTagsWithItems(nextItems);
      editor.resetForm();
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : uiCopy.items.mutations.createOrUpdateFailed;
      editor.setItemError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(item: Item) {
    editor.setItemError(null);
    setItemNotice(null);
    editor.startEdit(item);
  }

  async function handleDelete(itemId: number) {
    try {
      editor.setItemError(null);
      setItemNotice(null);
      await apiClient.deleteItem(itemId);
      const nextItems = items.filter((item) => item.id !== itemId);
      setItems(nextItems);
      if (editor.editingId === itemId) {
        editor.resetForm();
      }
      syncTagsWithItems(nextItems);
      setItemNotice(uiCopy.items.mutations.deleted);
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : uiCopy.items.mutations.deleteFailed;
      editor.setItemError(message);
    }
  }

  return {
    handleDelete,
    handleEdit,
    handleSubmit,
    itemNotice,
    submitting,
  };
}
