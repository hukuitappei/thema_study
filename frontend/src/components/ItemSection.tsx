import { ItemEditorPanel } from "./ItemEditorPanel";
import { ItemListPanel } from "./ItemListPanel";
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
      <section className="panel">
        <header className="panel-header">
          <h2>API 状態</h2>
        </header>
        {itemState.loading ? <p>読み込み中...</p> : null}
        {itemState.pageError ? (
          <p className="error" role="alert">
            {itemState.pageError}
          </p>
        ) : null}
        {!itemState.loading && !itemState.pageError && itemState.health ? (
          <dl className="status-grid" aria-label="API status">
            <div>
              <dt>Status</dt>
              <dd>{itemState.health.status}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{itemState.health.service}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{itemState.health.version}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <ItemEditorPanel
        editingId={itemState.editingId}
        form={itemState.form}
        handleSubmit={itemState.handleSubmit}
        itemError={itemState.itemError}
        itemNotice={itemState.itemNotice}
        resetForm={itemState.resetForm}
        setForm={itemState.setForm}
        setTagInput={itemState.setTagInput}
        submitting={itemState.submitting}
        tagInput={itemState.tagInput}
        user={user}
      />

      <ItemListPanel
        currentPage={itemState.currentPage}
        handleDelete={itemState.handleDelete}
        handleEdit={itemState.handleEdit}
        handleOwnershipFilterChange={itemState.handleOwnershipFilterChange}
        handleSearchQueryChange={itemState.handleSearchQueryChange}
        handleSelectTag={itemState.handleSelectTag}
        handleSortKeyChange={itemState.handleSortKeyChange}
        itemSortOptions={itemState.itemSortOptions}
        itemsPerPage={itemState.itemsPerPage}
        onNextPage={itemState.onNextPage}
        onPreviousPage={itemState.onPreviousPage}
        ownershipFilter={itemState.ownershipFilter}
        ownershipFilterOptions={itemState.ownershipFilterOptions}
        paginatedItems={itemState.paginatedItems}
        searchQuery={itemState.searchQuery}
        selectedTag={itemState.selectedTag}
        sortKey={itemState.sortKey}
        tags={itemState.tags}
        totalPages={itemState.totalPages}
        user={user}
        visibleItems={itemState.visibleItems}
      />
    </>
  );
}
