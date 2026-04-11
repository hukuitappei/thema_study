import { useEffect, useState, type FormEvent } from "react";
import type { components } from "../generated/schema";
import { parseTagInput } from "../lib/item-utils";

type Item = components["schemas"]["ItemRead"];
type ItemCreate = components["schemas"]["ItemCreate"];

export function useItemEditor(currentUsername: string | null) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ItemCreate>({
    title: "",
    description: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [itemError, setItemError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUsername) {
      setForm({ title: "", description: "", tags: [] });
      setTagInput("");
      setEditingId(null);
      setItemError(null);
    }
  }, [currentUsername]);

  function resetForm() {
    setForm({ title: "", description: "", tags: [] });
    setTagInput("");
    setEditingId(null);
    setItemError(null);
  }

  function buildItemPayload() {
    return {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      tags: parseTagInput(tagInput),
    };
  }

  function validateItemPayload(payload: ItemCreate) {
    if (!payload.title) {
      return "タイトルは必須です。";
    }
    if (payload.title.length > 120) {
      return "タイトルは120文字以内にしてください。";
    }
    if ((payload.tags ?? []).length > 10) {
      return "タグは10件以内にしてください。";
    }
    return null;
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setItemError(null);
    setForm({
      title: item.title,
      description: item.description ?? "",
      tags: item.tags.map((tag) => tag.name),
    });
    setTagInput(item.tags.map((tag) => tag.name).join(", "));
  }

  function validateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildItemPayload();
    const validationError = validateItemPayload(payload);
    if (validationError) {
      setItemError(validationError);
      return null;
    }

    return payload;
  }

  return {
    editingId,
    form,
    itemError,
    resetForm,
    setForm,
    setItemError,
    setTagInput,
    startEdit,
    tagInput,
    validateSubmit,
  };
}
