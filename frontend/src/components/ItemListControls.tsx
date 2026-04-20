import type { ItemSortKey, OwnershipFilterKey } from "../lib/item-utils";
import { uiCopy } from "../lib/ui-copy";

type ItemListControlsProps = {
  handleOwnershipFilterChange: (value: OwnershipFilterKey) => void;
  handleSearchQueryChange: (value: string) => void;
  handleSortKeyChange: (value: ItemSortKey) => void;
  itemSortOptions: Record<ItemSortKey, string>;
  ownershipFilter: OwnershipFilterKey;
  ownershipFilterOptions: Record<OwnershipFilterKey, string>;
  searchQuery: string;
  sortKey: ItemSortKey;
  showOwnershipFilter: boolean;
};

export function ItemListControls({
  handleOwnershipFilterChange,
  handleSearchQueryChange,
  handleSortKeyChange,
  itemSortOptions,
  ownershipFilter,
  ownershipFilterOptions,
  searchQuery,
  sortKey,
  showOwnershipFilter,
}: ItemListControlsProps) {
  return (
    <div className="list-controls">
      {showOwnershipFilter ? (
        <label className="control-field">
          <span>{uiCopy.items.list.controls.ownership}</span>
          <select
            aria-label={uiCopy.items.list.controls.ownership}
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
        <span>{uiCopy.items.list.controls.search}</span>
        <input
          aria-label={uiCopy.items.list.controls.search}
          value={searchQuery}
          onChange={(event) => handleSearchQueryChange(event.target.value)}
          placeholder={uiCopy.items.list.controls.searchPlaceholder}
        />
      </label>
      <label className="control-field">
        <span>{uiCopy.items.list.controls.sort}</span>
        <select
          aria-label={uiCopy.items.list.controls.sort}
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
  );
}
