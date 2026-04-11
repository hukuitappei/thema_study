import { useEffect, useState } from "react";
import type { components } from "../generated/schema";

type Item = components["schemas"]["ItemRead"];
type TagSummary = components["schemas"]["TagSummary"];

function buildTagSummaries(items: Item[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, item_count]) => ({ name, item_count }))
    .sort(
      (left, right) =>
        right.item_count - left.item_count || left.name.localeCompare(right.name, "ja"),
    );
}

type UseTagSummaryParams = {
  initialTags: TagSummary[];
  selectedTag: string | null;
  clearSelectedTag: () => void;
};

export function useTagSummary({
  initialTags,
  selectedTag,
  clearSelectedTag,
}: UseTagSummaryParams) {
  const [tags, setTags] = useState<TagSummary[]>(initialTags);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  function syncTagsWithItems(nextItems: Item[]) {
    const nextTags = buildTagSummaries(nextItems);
    setTags(nextTags);

    if (selectedTag && !nextTags.some((tag) => tag.name === selectedTag)) {
      clearSelectedTag();
    }
  }

  return {
    tags,
    syncTagsWithItems,
  };
}
