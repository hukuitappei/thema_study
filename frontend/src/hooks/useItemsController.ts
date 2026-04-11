import { useEffect, useState, type FormEvent } from "react";
import type { components } from "../generated/schema";
import { apiClient } from "../lib/api";
import {
  itemSortOptions,
  itemsPerPage,
  ownershipFilterOptions,
  useItemFilters,
} from "./useItemFilters";
import { useItemEditor } from "./useItemEditor";

type HealthResponse = components["schemas"]["HealthResponse"];
type Item = components["schemas"]["ItemRead"];
type TagSummary = components["schemas"]["TagSummary"];

export function useItemsController(currentUsername: string | null) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [tags, setTags] = useState<TagSummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [itemNotice, setItemNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const filters = useItemFilters({
    currentUsername,
    items,
    loading,
  });
  const editor = useItemEditor(currentUsername);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        const [healthResponse, itemsResponse, tagsResponse] = await Promise.all([
          apiClient.getHealth(),
          apiClient.listItems(),
          apiClient.listTags(),
        ]);

        if (!active) {
          return;
        }

        setHealth(healthResponse);
        setItems(itemsResponse.items);
        setTags(tagsResponse.tags);
        setPageError(null);
      } catch (cause) {
        if (!active) {
          return;
        }

        const message =
          cause instanceof Error ? cause.message : "読み込みに失敗しました。";
        setPageError(`初期化エラー: ${message}`);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  function refreshTagsFromItems(nextItems: Item[]) {
    const counts = new Map<string, number>();
    for (const item of nextItems) {
      for (const tag of item.tags) {
        counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1);
      }
    }

    setTags(
      [...counts.entries()]
        .map(([name, item_count]) => ({ name, item_count }))
        .sort(
          (left, right) =>
            right.item_count - left.item_count ||
            left.name.localeCompare(right.name, "ja"),
        ),
    );

    if (filters.selectedTag && !counts.has(filters.selectedTag)) {
      filters.clearSelectedTag();
    }
  }

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
        setItems(nextItems);
        setItemNotice("アイテムを追加しました。");
      } else {
        const updated = await apiClient.updateItem(editor.editingId, payload);
        nextItems = items.map((item) => (item.id === updated.id ? updated : item));
        setItems(nextItems);
        setItemNotice("アイテムを更新しました。");
      }

      refreshTagsFromItems(nextItems);
      editor.resetForm();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "アイテム操作に失敗しました。";
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
      refreshTagsFromItems(nextItems);
      setItemNotice("アイテムを削除しました。");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "アイテム削除に失敗しました。";
      editor.setItemError(message);
    }
  }

  return {
    currentPage: filters.currentPage,
    editingId: editor.editingId,
    form: editor.form,
    handleDelete,
    handleEdit,
    handleOwnershipFilterChange: filters.handleOwnershipFilterChange,
    handleSearchQueryChange: filters.handleSearchQueryChange,
    handleSelectTag: filters.handleSelectTag,
    handleSubmit,
    handleSortKeyChange: filters.handleSortKeyChange,
    health,
    itemError: editor.itemError,
    itemNotice,
    itemSortOptions,
    itemsPerPage,
    loading,
    onNextPage: filters.onNextPage,
    onPreviousPage: filters.onPreviousPage,
    ownershipFilter: filters.ownershipFilter,
    ownershipFilterOptions,
    pageError,
    paginatedItems: filters.paginatedItems,
    resetForm: editor.resetForm,
    searchQuery: filters.searchQuery,
    selectedTag: filters.selectedTag,
    setForm: editor.setForm,
    setTagInput: editor.setTagInput,
    sortKey: filters.sortKey,
    submitting,
    tagInput: editor.tagInput,
    tags,
    totalPages: filters.totalPages,
    visibleItems: filters.visibleItems,
  };
}
