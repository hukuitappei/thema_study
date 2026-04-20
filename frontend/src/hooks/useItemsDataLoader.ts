import { useEffect, useState } from "react";
import type { components } from "../generated/schema";
import { apiClient } from "../lib/api";
import { uiCopy } from "../lib/ui-copy";

type HealthResponse = components["schemas"]["HealthResponse"];
type Item = components["schemas"]["ItemRead"];
type TagSummary = components["schemas"]["TagSummary"];

export function useItemsDataLoader() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [initialTags, setInitialTags] = useState<TagSummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        const [healthResponse, itemsResponse, tagsResponse] = await Promise.all([
          apiClient.getHealth(),
          apiClient.listItems(),
          apiClient.listTags(),
        ]);

        if (!active) {
          return;
        }

        setHealth(healthResponse);
        setItems(itemsResponse.items);
        setInitialTags(tagsResponse.tags);
        setPageError(null);
      } catch (cause) {
        if (!active) {
          return;
        }

        const message =
          cause instanceof Error ? cause.message : uiCopy.items.status.loadFailed;
        setPageError(uiCopy.items.status.pageError(message));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  return {
    health,
    initialTags,
    items,
    loading,
    pageError,
    setItems,
    setPageError,
  };
}
