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
    status: {
      health: data.health,
      loading: data.loading,
      pageError: data.pageError,
    },
    editor: {
      editingId: editor.editingId,
      form: editor.form,
      handleSubmit: mutations.handleSubmit,
      itemError: editor.itemError,
      itemNotice: mutations.itemNotice,
      resetForm: editor.resetForm,
      setForm: editor.setForm,
      setTagInput: editor.setTagInput,
      submitting: mutations.submitting,
      tagInput: editor.tagInput,
    },
    list: {
      currentPage: filters.currentPage,
      handleDelete: mutations.handleDelete,
      handleEdit: mutations.handleEdit,
      handleOwnershipFilterChange: filters.handleOwnershipFilterChange,
      handleSearchQueryChange: filters.handleSearchQueryChange,
      handleSelectTag: filters.handleSelectTag,
      handleSortKeyChange: filters.handleSortKeyChange,
      itemSortOptions,
      itemsPerPage,
      onNextPage: filters.onNextPage,
      onPreviousPage: filters.onPreviousPage,
      ownershipFilter: filters.ownershipFilter,
      ownershipFilterOptions,
      paginatedItems: filters.paginatedItems,
      searchQuery: filters.searchQuery,
      selectedTag: filters.selectedTag,
      sortKey: filters.sortKey,
      tags: tagSummary.tags,
      totalPages: filters.totalPages,
      visibleItems: filters.visibleItems,
    },
  };
}
