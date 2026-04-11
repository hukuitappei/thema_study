import { useState } from "react";

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

export function TagFilterBar({
  tags,
  selectedTag,
  onSelectTag,
}: TagFilterBarProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const selectedTagSummary =
    selectedTag === null
      ? null
      : tags.find((tag) => tag.name === selectedTag) ?? {
          name: selectedTag,
          item_count: 0,
        };
  const visibleTags = showAllTags ? tags : tags.slice(0, defaultVisibleTagCount);
  const shouldIncludeSelectedTag =
    selectedTagSummary !== null &&
    !visibleTags.some((tag) => tag.name === selectedTagSummary.name);
  const displayedTags = shouldIncludeSelectedTag
    ? [...visibleTags, selectedTagSummary]
    : visibleTags;
  const canExpandTags = tags.length > defaultVisibleTagCount;

  return (
    <div className="tag-filter-section">
      <div className="tag-filter-header">
        <div>
          <p className="tag-filter-title">人気タグ</p>
          <p className="tag-filter-caption">
            {tags.length} tags available
            {selectedTagSummary
              ? ` / 現在: #${selectedTagSummary.name}`
              : " / 現在: すべて"}
          </p>
        </div>
        {canExpandTags ? (
          <div className="tag-filter-actions">
            <span className="tag-filter-overflow">
              {showAllTags
                ? `${displayedTags.length} 件を表示中`
                : `上位 ${displayedTags.length} 件を表示中`}
            </span>
            <button
              className="tag-filter-toggle"
              onClick={() => setShowAllTags((current) => !current)}
              type="button"
            >
              {showAllTags ? "たたむ" : "もっと見る"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="tag-filter-bar" aria-label="タグ絞り込み">
        <button
          className={selectedTag === null ? "tag-filter active" : "tag-filter"}
          onClick={() => onSelectTag(null)}
          type="button"
        >
          すべて
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
