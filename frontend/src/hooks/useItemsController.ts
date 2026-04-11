import {
  itemSortOptions,
  itemsPerPage,
  ownershipFilterOptions,
  useItemFilters,
} from "./useItemFilters";
import { useItemEditor } from "./useItemEditor";
import { useItemMutations } from "./useItemMutations";
import { useItemsDataLoader } from "./useItemsDataLoader";
import { useTagSummary } from "./useTagSummary";

export function useItemsController(currentUsername: string | null) {
  const data = useItemsDataLoader();
  const editor = useItemEditor(currentUsername);
  const filters = useItemFilters({
    currentUsername,
    items: data.items,
    loading: data.loading,
  });
  const tagSummary = useTagSummary({
    clearSelectedTag: filters.clearSelectedTag,
    initialTags: data.initialTags,
    selectedTag: filters.selectedTag,
  });
  const mutations = useItemMutations({
    editor,
    items: data.items,
    setItems: data.setItems,
    setPageError: data.setPageError,
    syncTagsWithItems: tagSummary.syncTagsWithItems,
  });

  return {
    currentPage: filters.currentPage,
    editingId: editor.editingId,
    form: editor.form,
    handleDelete: mutations.handleDelete,
    handleEdit: mutations.handleEdit,
    handleOwnershipFilterChange: filters.handleOwnershipFilterChange,
    handleSearchQueryChange: filters.handleSearchQueryChange,
    handleSelectTag: filters.handleSelectTag,
    handleSubmit: mutations.handleSubmit,
    handleSortKeyChange: filters.handleSortKeyChange,
    health: data.health,
    itemError: editor.itemError,
    itemNotice: mutations.itemNotice,
    itemSortOptions,
    itemsPerPage,
    loading: data.loading,
    onNextPage: filters.onNextPage,
    onPreviousPage: filters.onPreviousPage,
    ownershipFilter: filters.ownershipFilter,
    ownershipFilterOptions,
    pageError: data.pageError,
    paginatedItems: filters.paginatedItems,
    resetForm: editor.resetForm,
    searchQuery: filters.searchQuery,
    selectedTag: filters.selectedTag,
    setForm: editor.setForm,
    setTagInput: editor.setTagInput,
    sortKey: filters.sortKey,
    submitting: mutations.submitting,
    tagInput: editor.tagInput,
    tags: tagSummary.tags,
    totalPages: filters.totalPages,
    visibleItems: filters.visibleItems,
  };
}
