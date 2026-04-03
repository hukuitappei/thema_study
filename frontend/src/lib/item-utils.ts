import type { components } from "../generated/schema";

type Item = components["schemas"]["ItemRead"];

export type ItemSortKey = "newest" | "oldest" | "title";
export type OwnershipFilterKey = "all" | "mine";

export function formatItemDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function parseTagInput(rawValue: string) {
  const seen = new Set<string>();
  return rawValue
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0)
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
}

export function filterAndSortItems(params: {
  items: Item[];
  ownershipFilter: OwnershipFilterKey;
  currentUsername: string | null;
  searchQuery: string;
  selectedTag: string | null;
  sortKey: ItemSortKey;
}) {
  const {
    items,
    ownershipFilter,
    currentUsername,
    searchQuery,
    selectedTag,
    sortKey,
  } = params;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return [...items]
    .filter((item) => {
      if (
        ownershipFilter === "mine" &&
        currentUsername &&
        item.owner.username !== currentUsername
      ) {
        return false;
      }

      if (selectedTag && !item.tags.some((tag) => tag.name === selectedTag)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        item.title,
        item.description ?? "",
        item.tags.map((tag) => tag.name).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .sort((left, right) => {
      if (sortKey === "title") {
        return left.title.localeCompare(right.title, "ja");
      }

      const leftTime = new Date(left.created_at).getTime();
      const rightTime = new Date(right.created_at).getTime();
      return sortKey === "oldest" ? leftTime - rightTime : rightTime - leftTime;
    });
}
