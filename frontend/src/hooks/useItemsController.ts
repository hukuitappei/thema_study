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

export type ItemsController = {
  status: {
    health: ReturnType<typeof useItemsDataLoader>["health"];
    loading: ReturnType<typeof useItemsDataLoader>["loading"];
    pageError: ReturnType<typeof useItemsDataLoader>["pageError"];
  };
  editor: {
    editingId: ReturnType<typeof useItemEditor>["editingId"];
    form: ReturnType<typeof useItemEditor>["form"];
    handleSubmit: ReturnType<typeof useItemMutations>["handleSubmit"];
    itemError: ReturnType<typeof useItemEditor>["itemError"];
    itemNotice: ReturnType<typeof useItemMutations>["itemNotice"];
    resetForm: ReturnType<typeof useItemEditor>["resetForm"];
    setForm: ReturnType<typeof useItemEditor>["setForm"];
    setTagInput: ReturnType<typeof useItemEditor>["setTagInput"];
    submitting: ReturnType<typeof useItemMutations>["submitting"];
    tagInput: ReturnType<typeof useItemEditor>["tagInput"];
  };
  list: {
    currentPage: ReturnType<typeof useItemFilters>["currentPage"];
    deletingId: ReturnType<typeof useItemMutations>["deletingId"];
    handleDelete: ReturnType<typeof useItemMutations>["handleDelete"];
    handleEdit: ReturnType<typeof useItemMutations>["handleEdit"];
    handleOwnershipFilterChange: ReturnType<typeof useItemFilters>["handleOwnershipFilterChange"];
    handleSearchQueryChange: ReturnType<typeof useItemFilters>["handleSearchQueryChange"];
    handleSelectTag: ReturnType<typeof useItemFilters>["handleSelectTag"];
    handleSortKeyChange: ReturnType<typeof useItemFilters>["handleSortKeyChange"];
    itemSortOptions: typeof itemSortOptions;
    itemsPerPage: typeof itemsPerPage;
    onNextPage: ReturnType<typeof useItemFilters>["onNextPage"];
    onPreviousPage: ReturnType<typeof useItemFilters>["onPreviousPage"];
    ownershipFilter: ReturnType<typeof useItemFilters>["ownershipFilter"];
    ownershipFilterOptions: typeof ownershipFilterOptions;
    paginatedItems: ReturnType<typeof useItemFilters>["paginatedItems"];
    searchQuery: ReturnType<typeof useItemFilters>["searchQuery"];
    selectedTag: ReturnType<typeof useItemFilters>["selectedTag"];
    sortKey: ReturnType<typeof useItemFilters>["sortKey"];
    tags: ReturnType<typeof useTagSummary>["tags"];
    totalPages: ReturnType<typeof useItemFilters>["totalPages"];
    visibleItems: ReturnType<typeof useItemFilters>["visibleItems"];
  };
};

export function useItemsController(
  currentUsername: string | null,
): ItemsController {
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
      deletingId: mutations.deletingId,
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
