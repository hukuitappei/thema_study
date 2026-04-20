import { ItemCardList } from "./ItemCardList";
import { ItemListControls } from "./ItemListControls";
import { ItemPaginationBar } from "./ItemPaginationBar";
import { TagFilterBar } from "./TagFilterBar";
import type { ItemSortKey, OwnershipFilterKey } from "../lib/item-utils";
import type { components } from "../generated/schema";
import { uiCopy } from "../lib/ui-copy";

type Item = components["schemas"]["ItemRead"];
type TagSummary = components["schemas"]["TagSummary"];
type UserProfile = components["schemas"]["UserProfile"];

type ItemListPanelProps = {
  currentPage: number;
  deletingId: number | null;
  handleDelete: (itemId: number) => Promise<void>;
  handleEdit: (item: Item) => void;
  handleOwnershipFilterChange: (value: OwnershipFilterKey) => void;
  handleSearchQueryChange: (value: string) => void;
  handleSelectTag: (tag: string | null) => void;
  handleSortKeyChange: (value: ItemSortKey) => void;
  itemSortOptions: Record<ItemSortKey, string>;
  itemsPerPage: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  ownershipFilter: OwnershipFilterKey;
  ownershipFilterOptions: Record<OwnershipFilterKey, string>;
  paginatedItems: Item[];
  searchQuery: string;
  selectedTag: string | null;
  sortKey: ItemSortKey;
  tags: TagSummary[];
  totalPages: number;
  user: UserProfile | null;
  visibleItems: Item[];
};

function getListSummary(selectedTag: string | null, visibleCount: number) {
  return selectedTag
    ? uiCopy.items.list.summaryTag(selectedTag, visibleCount)
    : uiCopy.items.list.summaryAll(visibleCount);
}

function getEmptyStateMessage(
  selectedTag: string | null,
  ownershipFilter: OwnershipFilterKey,
) {
  if (selectedTag) {
    return uiCopy.items.list.emptyByTag(selectedTag);
  }

  if (ownershipFilter === "mine") {
    return uiCopy.items.list.emptyMine;
  }

  return uiCopy.items.list.emptyAll;
}

export function ItemListPanel({
  currentPage,
  deletingId,
  handleDelete,
  handleEdit,
  handleOwnershipFilterChange,
  handleSearchQueryChange,
  handleSelectTag,
  handleSortKeyChange,
  itemSortOptions,
  itemsPerPage,
  onNextPage,
  onPreviousPage,
  ownershipFilter,
  ownershipFilterOptions,
  paginatedItems,
  searchQuery,
  selectedTag,
  sortKey,
  tags,
  totalPages,
  user,
  visibleItems,
}: ItemListPanelProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{uiCopy.items.list.heading}</h2>
        <span>{uiCopy.items.list.headerPage(currentPage, totalPages)}</span>
      </header>

      <p className="list-summary">{getListSummary(selectedTag, visibleItems.length)}</p>

      <TagFilterBar
        tags={tags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
      />

      <ItemListControls
        handleOwnershipFilterChange={handleOwnershipFilterChange}
        handleSearchQueryChange={handleSearchQueryChange}
        handleSortKeyChange={handleSortKeyChange}
        itemSortOptions={itemSortOptions}
        ownershipFilter={ownershipFilter}
        ownershipFilterOptions={ownershipFilterOptions}
        searchQuery={searchQuery}
        showOwnershipFilter={user !== null}
        sortKey={sortKey}
      />

      <ItemPaginationBar
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        paginatedCount={paginatedItems.length}
        totalPages={totalPages}
        visibleCount={visibleItems.length}
      />

      <ItemCardList
        deletingId={deletingId}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        items={paginatedItems}
        user={user}
      />

      {!visibleItems.length ? (
        <p className="empty-state">
          {getEmptyStateMessage(selectedTag, ownershipFilter)}
        </p>
      ) : null}
    </section>
  );
}
