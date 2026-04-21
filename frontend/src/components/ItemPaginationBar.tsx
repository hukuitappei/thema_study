import { uiCopy } from "../lib/ui-copy";

type ItemPaginationBarProps = {
  currentPage: number;
  itemsPerPage: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  paginatedCount: number;
  totalPages: number;
  visibleCount: number;
};

export function ItemPaginationBar({
  currentPage,
  itemsPerPage,
  onNextPage,
  onPreviousPage,
  paginatedCount,
  totalPages,
  visibleCount,
}: ItemPaginationBarProps) {
  if (visibleCount <= itemsPerPage) {
    return null;
  }

  return (
    <div className="pagination-bar" aria-label={uiCopy.items.list.pagination.ariaLabel}>
      <button
        className="ghost-button"
        disabled={currentPage === 1}
        onClick={onPreviousPage}
        type="button"
      >
        {uiCopy.items.list.pagination.previous}
      </button>
      <span className="pagination-summary">
        {uiCopy.items.list.pagination.summary(paginatedCount, visibleCount)}
      </span>
      <button
        className="ghost-button"
        disabled={currentPage === totalPages}
        onClick={onNextPage}
        type="button"
      >
        {uiCopy.items.list.pagination.next}
      </button>
    </div>
  );
}
