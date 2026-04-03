type TagSummary = {
  name: string;
  item_count: number;
};

type TagFilterBarProps = {
  tags: TagSummary[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
};

export function TagFilterBar({
  tags,
  selectedTag,
  onSelectTag,
}: TagFilterBarProps) {
  return (
    <div className="tag-filter-bar" aria-label="タグ絞り込み">
      <button
        className={selectedTag === null ? "tag-filter active" : "tag-filter"}
        onClick={() => onSelectTag(null)}
        type="button"
      >
        すべて
      </button>
      {tags.map((tag) => (
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
  );
}
