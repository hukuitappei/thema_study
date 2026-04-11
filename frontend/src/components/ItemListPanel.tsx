import { TagFilterBar } from "./TagFilterBar";
import { formatItemDate, type ItemSortKey, type OwnershipFilterKey } from "../lib/item-utils";
import type { components } from "../generated/schema";

type Item = components["schemas"]["ItemRead"];
type TagSummary = components["schemas"]["TagSummary"];
type UserProfile = components["schemas"]["UserProfile"];

type ItemListPanelProps = {
  currentPage: number;
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

export function ItemListPanel({
  currentPage,
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
        <h2>サンプルデータ</h2>
        <span>
          {visibleItems.length} items / Page {currentPage} of {totalPages}
        </span>
      </header>

      <TagFilterBar
        tags={tags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
      />

      <div className="list-controls">
        {user ? (
          <label className="control-field">
            <span>表示範囲</span>
            <select
              aria-label="表示範囲"
              value={ownershipFilter}
              onChange={(event) =>
                handleOwnershipFilterChange(
                  event.target.value as OwnershipFilterKey,
                )
              }
            >
              {Object.entries(ownershipFilterOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="control-field">
          <span>検索</span>
          <input
            aria-label="検索"
            value={searchQuery}
            onChange={(event) => handleSearchQueryChange(event.target.value)}
            placeholder="タイトル・説明・タグで絞り込む"
          />
        </label>
        <label className="control-field">
          <span>並び順</span>
          <select
            aria-label="並び順"
            value={sortKey}
            onChange={(event) =>
              handleSortKeyChange(event.target.value as ItemSortKey)
            }
          >
            {Object.entries(itemSortOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visibleItems.length > itemsPerPage ? (
        <div className="pagination-bar" aria-label="Pagination">
          <button
            className="ghost-button"
            disabled={currentPage === 1}
            onClick={onPreviousPage}
            type="button"
          >
            Previous
          </button>
          <span className="pagination-summary">
            Showing {paginatedItems.length} of {visibleItems.length} items
          </span>
          <button
            className="ghost-button"
            disabled={currentPage === totalPages}
            onClick={onNextPage}
            type="button"
          >
            Next
          </button>
        </div>
      ) : null}

      <ul className="item-list">
        {paginatedItems.map((item) => (
          <li key={item.id} className="item-card">
            <strong>{item.title}</strong>
            <p className="item-owner">
              作成者: {item.owner.display_name} (@{item.owner.username})
            </p>
            <time className="item-timestamp" dateTime={item.created_at}>
              {formatItemDate(item.created_at)}
            </time>
            {item.tags.length ? (
              <div className="item-tags">
                {item.tags.map((tag) => (
                  <span key={tag.name} className="tag-chip">
                    #{tag.name}
                  </span>
                ))}
              </div>
            ) : null}
            <p>{item.description ?? "説明はありません。"}</p>
            {user?.username === item.owner.username ? (
              <div className="item-actions">
                <button
                  className="ghost-button"
                  onClick={() => handleEdit(item)}
                  type="button"
                >
                  編集
                </button>
                <button
                  className="danger-button"
                  onClick={() => void handleDelete(item.id)}
                  type="button"
                >
                  削除
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {!visibleItems.length ? (
        <p className="empty-state">
          {selectedTag
            ? `#${selectedTag} に一致するアイテムはありません。`
            : ownershipFilter === "mine"
              ? "自分のアイテムはまだありません。"
              : "条件に一致するアイテムはありません。"}
        </p>
      ) : null}
    </section>
  );
}
