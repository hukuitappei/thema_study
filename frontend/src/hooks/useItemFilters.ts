import { useEffect, useMemo, useState } from "react";
import type { components } from "../generated/schema";
import {
  filterAndSortItems,
  type ItemSortKey,
  type OwnershipFilterKey,
} from "../lib/item-utils";
import { uiCopy } from "../lib/ui-copy";

type Item = components["schemas"]["ItemRead"];

export const itemsPerPage = 6;

export const itemSortOptions: Record<ItemSortKey, string> = {
  newest: uiCopy.items.list.sortOptions.newest,
  oldest: uiCopy.items.list.sortOptions.oldest,
  title: uiCopy.items.list.sortOptions.title,
};

export const ownershipFilterOptions: Record<OwnershipFilterKey, string> = {
  all: uiCopy.items.list.ownershipOptions.all,
  mine: uiCopy.items.list.ownershipOptions.mine,
};

function readSelectedTagFromLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  const tag = new URLSearchParams(window.location.search).get("tag")?.trim();
  return tag ? tag : null;
}

function readSearchQueryFromLocation() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
}

function readSortKeyFromLocation(): ItemSortKey {
  if (typeof window === "undefined") {
    return "newest";
  }

  const value = new URLSearchParams(window.location.search).get("sort");
  return value === "oldest" || value === "title" ? value : "newest";
}

function readOwnershipFilterFromLocation(): OwnershipFilterKey {
  if (typeof window === "undefined") {
    return "all";
  }

  return new URLSearchParams(window.location.search).get("owner") === "mine"
    ? "mine"
    : "all";
}

function readPageFromLocation() {
  if (typeof window === "undefined") {
    return 1;
  }

  const rawValue = Number(new URLSearchParams(window.location.search).get("page"));
  return Number.isInteger(rawValue) && rawValue > 0 ? rawValue : 1;
}

type UseItemFiltersParams = {
  currentUsername: string | null;
  items: Item[];
  loading: boolean;
};

export function useItemFilters({
  currentUsername,
  items,
  loading,
}: UseItemFiltersParams) {
  const [selectedTag, setSelectedTag] = useState<string | null>(
    readSelectedTagFromLocation,
  );
  const [searchQuery, setSearchQuery] = useState(readSearchQueryFromLocation);
  const [sortKey, setSortKey] = useState<ItemSortKey>(readSortKeyFromLocation);
  const [ownershipFilter, setOwnershipFilter] =
    useState<OwnershipFilterKey>(readOwnershipFilterFromLocation);
  const [currentPage, setCurrentPage] = useState(readPageFromLocation);

  const visibleItems = useMemo(
    () =>
      filterAndSortItems({
        items,
        ownershipFilter,
        currentUsername,
        searchQuery,
        selectedTag,
        sortKey,
      }),
    [currentUsername, items, ownershipFilter, searchQuery, selectedTag, sortKey],
  );

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return visibleItems.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, visibleItems]);

  useEffect(() => {
    if (!loading && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, loading, totalPages]);

  useEffect(() => {
    if (!currentUsername && ownershipFilter === "mine") {
      setOwnershipFilter("all");
      setCurrentPage(1);
    }
  }, [currentUsername, ownershipFilter]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedTag) {
      params.set("tag", selectedTag);
    }
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (sortKey !== "newest") {
      params.set("sort", sortKey);
    }
    if (currentUsername && ownershipFilter === "mine") {
      params.set("owner", ownershipFilter);
    }
    if (currentPage > 1) {
      params.set("page", String(currentPage));
    }

    const nextSearch = params.toString();
    const nextUrl = nextSearch
      ? `${window.location.pathname}?${nextSearch}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [currentPage, currentUsername, ownershipFilter, searchQuery, selectedTag, sortKey]);

  function handleSelectTag(tag: string | null) {
    setSelectedTag(tag);
    setCurrentPage(1);
  }

  function handleSearchQueryChange(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function handleSortKeyChange(value: ItemSortKey) {
    setSortKey(value);
    setCurrentPage(1);
  }

  function handleOwnershipFilterChange(value: OwnershipFilterKey) {
    setOwnershipFilter(value);
    setCurrentPage(1);
  }

  function clearSelectedTag() {
    setSelectedTag(null);
    setCurrentPage(1);
  }

  return {
    currentPage,
    handleOwnershipFilterChange,
    handleSearchQueryChange,
    handleSelectTag,
    handleSortKeyChange,
    itemSortOptions,
    itemsPerPage,
    onNextPage: () => setCurrentPage((page) => Math.min(totalPages, page + 1)),
    onPreviousPage: () => setCurrentPage((page) => Math.max(1, page - 1)),
    ownershipFilter,
    ownershipFilterOptions,
    paginatedItems,
    searchQuery,
    selectedTag,
    sortKey,
    totalPages,
    visibleItems,
    clearSelectedTag,
  };
}
