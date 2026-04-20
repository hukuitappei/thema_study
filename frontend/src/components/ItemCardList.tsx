import { formatItemDate } from "../lib/item-utils";
import type { components } from "../generated/schema";
import { uiCopy } from "../lib/ui-copy";

type Item = components["schemas"]["ItemRead"];
type UserProfile = components["schemas"]["UserProfile"];

type ItemCardListProps = {
  deletingId: number | null;
  handleDelete: (itemId: number) => Promise<void>;
  handleEdit: (item: Item) => void;
  items: Item[];
  user: UserProfile | null;
};

export function ItemCardList({
  deletingId,
  handleDelete,
  handleEdit,
  items,
  user,
}: ItemCardListProps) {
  return (
    <ul className="item-list">
      {items.map((item) => (
        <li key={item.id} className="item-card">
          <strong>{item.title}</strong>
          <p className="item-owner">
            {uiCopy.items.list.card.owner(
              item.owner.display_name,
              item.owner.username,
            )}
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
          <p>{item.description ?? uiCopy.items.list.card.noDescription}</p>
          {user?.username === item.owner.username ? (
            <div className="item-actions">
              <button
                className="ghost-button"
                onClick={() => handleEdit(item)}
                type="button"
              >
                {uiCopy.items.list.card.edit}
              </button>
              <button
                className="danger-button"
                disabled={deletingId === item.id}
                onClick={() => void handleDelete(item.id)}
                type="button"
              >
                {uiCopy.items.list.card.delete}
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
