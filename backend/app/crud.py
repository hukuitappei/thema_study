from sqlalchemy.orm import Session

from app.models import Item
from app.schemas import ItemCreate, ItemUpdate


def list_items(db: Session) -> list[Item]:
    return db.query(Item).order_by(Item.id.desc()).all()


def create_item(db: Session, payload: ItemCreate) -> Item:
    item = Item(title=payload.title, description=payload.description)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_item(db: Session, item_id: int) -> Item | None:
    return db.get(Item, item_id)


def update_item(db: Session, item: Item, payload: ItemUpdate) -> Item:
    item.title = payload.title
    item.description = payload.description
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item: Item) -> None:
    db.delete(item)
    db.commit()
