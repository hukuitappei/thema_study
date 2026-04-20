import { useMemo, useState } from "react";
import { uiCopy } from "../lib/ui-copy";

type TagSummary = {
  name: string;
  item_count: number;
};

type TagFilterBarProps = {
  tags: TagSummary[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
};

const defaultVisibleTagCount = 8;
type TagSortKey = "popular" | "name";

function sortTags(tags: TagSummary[], sortKey: TagSortKey) {
  if (sortKey === "name") {
    return [...tags].sort((left, right) => left.name.localeCompare(right.name, "ja"));
  }

  return tags;
}

function buildDisplayedTags(
  tags: TagSummary[],
  selectedTag: string | null,
  showAllTags: boolean,
) {
  const selectedTagSummary =
    selectedTag === null
      ? null
      : tags.find((tag) => tag.name === selectedTag) ?? {
          name: selectedTag,
          item_count: 0,
        };
  const baseTags = showAllTags ? tags : tags.slice(0, defaultVisibleTagCount);
  const includesSelectedTag =
    selectedTagSummary !== null &&
    baseTags.some((tag) => tag.name === selectedTagSummary.name);

  return {
    displayedTags:
      selectedTagSummary !== null && !includesSelectedTag
        ? [...baseTags, selectedTagSummary]
        : baseTags,
    selectedTagSummary,
  };
}

export function TagFilterBar({
  tags,
  selectedTag,
  onSelectTag,
}: TagFilterBarProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const [sortKey, setSortKey] = useState<TagSortKey>("popular");
  const sortedTags = useMemo(() => sortTags(tags, sortKey), [sortKey, tags]);
  const { displayedTags, selectedTagSummary } = useMemo(
    () => buildDisplayedTags(sortedTags, selectedTag, showAllTags),
    [selectedTag, showAllTags, sortedTags],
  );
  const canExpandTags = tags.length > defaultVisibleTagCount;

  return (
    <div className="tag-filter-section">
      <div className="tag-filter-header">
        <div>
          <p className="tag-filter-title">{uiCopy.tags.title}</p>
          <p className="tag-filter-caption">
            {uiCopy.tags.caption(tags.length, selectedTagSummary?.name ?? null)}
          </p>
        </div>
        {canExpandTags ? (
          <div className="tag-filter-actions">
            <span className="tag-filter-overflow">
              {uiCopy.tags.overflow(displayedTags.length, showAllTags)}
            </span>
            <button
              className="tag-filter-toggle"
              onClick={() => setShowAllTags((current) => !current)}
              type="button"
            >
              {showAllTags ? uiCopy.tags.less : uiCopy.tags.more}
            </button>
          </div>
        ) : null}
      </div>

      <div className="tag-filter-toolbar">
        <label className="tag-filter-sort">
          <span>{uiCopy.tags.sortLabel}</span>
          <select
            aria-label={uiCopy.tags.sortLabel}
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as TagSortKey)}
          >
            <option value="popular">{uiCopy.tags.sortPopular}</option>
            <option value="name">{uiCopy.tags.sortName}</option>
          </select>
        </label>
      </div>

      <div className="tag-filter-bar" aria-label={uiCopy.tags.ariaLabel}>
        <button
          className={selectedTag === null ? "tag-filter active" : "tag-filter"}
          onClick={() => onSelectTag(null)}
          type="button"
        >
          {uiCopy.tags.all}
        </button>
        {displayedTags.map((tag) => (
          <button
            key={tag.name}
            className={selectedTag === tag.name ? "tag-filter active" : "tag-filter"}
            onClick={() => onSelectTag(tag.name)}
            type="button"
          >
            #{tag.name} ({tag.item_count})
          </button>
        ))}
      </div>
    </div>
  );
}
