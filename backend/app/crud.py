from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models import Item, Tag, User, item_tags
from app.schemas import ItemCreate, ItemUpdate


def normalize_tags(raw_tags: list[str]) -> list[str]:
    normalized: list[str] = []
    seen: set[str] = set()
    for value in raw_tags:
        tag = value.strip().lower()
        if not tag or tag in seen:
            continue
        seen.add(tag)
        normalized.append(tag)
    return normalized


def resolve_tags(db: Session, raw_tags: list[str]) -> list[Tag]:
    tags: list[Tag] = []
    for name in normalize_tags(raw_tags):
        tag = db.query(Tag).filter(Tag.name == name).one_or_none()
        if tag is None:
            tag = Tag(name=name)
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags


def list_items(db: Session) -> list[Item]:
    return (
        db.query(Item)
        .options(joinedload(Item.owner), joinedload(Item.tags))
        .order_by(Item.id.desc())
        .all()
    )


def list_tags(db: Session) -> list[dict[str, int | str]]:
    rows = (
        db.query(Tag.name, func.count(item_tags.c.item_id).label("item_count"))
        .outerjoin(item_tags, Tag.id == item_tags.c.tag_id)
        .group_by(Tag.id)
        .order_by(func.count(item_tags.c.item_id).desc(), Tag.name.asc())
        .all()
    )
    return [{"name": name, "item_count": item_count} for name, item_count in rows]


def create_item(db: Session, payload: ItemCreate, owner: User) -> Item:
    item = Item(
        title=payload.title,
        description=payload.description,
        owner_id=owner.id,
        tags=resolve_tags(db, payload.tags),
    )
    db.add(item)
    db.commit()
    return get_item(db, item.id)  # type: ignore[return-value]


def get_item(db: Session, item_id: int) -> Item | None:
    return (
        db.query(Item)
        .options(joinedload(Item.owner), joinedload(Item.tags))
        .filter(Item.id == item_id)
        .one_or_none()
    )


def update_item(db: Session, item: Item, payload: ItemUpdate) -> Item:
    item.title = payload.title
    item.description = payload.description
    item.tags = resolve_tags(db, payload.tags)
    db.add(item)
    db.commit()
    return get_item(db, item.id)  # type: ignore[return-value]


def delete_item(db: Session, item: Item) -> None:
    db.delete(item)
    db.commit()
