import { ItemEditorPanel } from "./ItemEditorPanel";
import { ItemListPanel } from "./ItemListPanel";
import { ItemStatusPanel } from "./ItemStatusPanel";
import type { components } from "../generated/schema";
import { useItemsController } from "../hooks/useItemsController";

type UserProfile = components["schemas"]["UserProfile"];

type ItemSectionProps = {
  user: UserProfile | null;
};

export function ItemSection({ user }: ItemSectionProps) {
  const itemState = useItemsController(user?.username ?? null);

  return (
    <>
      <ItemStatusPanel
        health={itemState.status.health}
        loading={itemState.status.loading}
        pageError={itemState.status.pageError}
      />

      <ItemEditorPanel
        editingId={itemState.editor.editingId}
        form={itemState.editor.form}
        handleSubmit={itemState.editor.handleSubmit}
        itemError={itemState.editor.itemError}
        itemNotice={itemState.editor.itemNotice}
        resetForm={itemState.editor.resetForm}
        setForm={itemState.editor.setForm}
        setTagInput={itemState.editor.setTagInput}
        submitting={itemState.editor.submitting}
        tagInput={itemState.editor.tagInput}
        user={user}
      />

      <ItemListPanel
        currentPage={itemState.list.currentPage}
        handleDelete={itemState.list.handleDelete}
        handleEdit={itemState.list.handleEdit}
        handleOwnershipFilterChange={itemState.list.handleOwnershipFilterChange}
        handleSearchQueryChange={itemState.list.handleSearchQueryChange}
        handleSelectTag={itemState.list.handleSelectTag}
        handleSortKeyChange={itemState.list.handleSortKeyChange}
        itemSortOptions={itemState.list.itemSortOptions}
        itemsPerPage={itemState.list.itemsPerPage}
        onNextPage={itemState.list.onNextPage}
        onPreviousPage={itemState.list.onPreviousPage}
        ownershipFilter={itemState.list.ownershipFilter}
        ownershipFilterOptions={itemState.list.ownershipFilterOptions}
        paginatedItems={itemState.list.paginatedItems}
        searchQuery={itemState.list.searchQuery}
        selectedTag={itemState.list.selectedTag}
        sortKey={itemState.list.sortKey}
        tags={itemState.list.tags}
        totalPages={itemState.list.totalPages}
        user={user}
        visibleItems={itemState.list.visibleItems}
      />
    </>
  );
}
