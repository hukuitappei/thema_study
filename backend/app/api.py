from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, login as login_user, register as register_user
from app import crud
from app.database import get_db
from app.schemas import (
    ItemCreate,
    ItemListResponse,
    ItemRead,
    ItemUpdate,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserProfile,
)

router = APIRouter(prefix="/api/items", tags=["items"])
auth_router = APIRouter(prefix="/api/auth", tags=["auth"])


@auth_router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    return login_user(payload, db)


@auth_router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest, db: Session = Depends(get_db)
) -> UserProfile:
    return register_user(payload, db)


@auth_router.get("/me", response_model=UserProfile)
def get_me(user: UserProfile = Depends(get_current_user)) -> UserProfile:
    return user


@router.get("", response_model=ItemListResponse)
def get_items(db: Session = Depends(get_db)) -> ItemListResponse:
    items = crud.list_items(db)
    return ItemListResponse(items=items)


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def post_item(
    payload: ItemCreate,
    db: Session = Depends(get_db),
    _: UserProfile = Depends(get_current_user),
) -> ItemRead:
    item = crud.create_item(db, payload)
    return ItemRead.model_validate(item)


@router.put("/{item_id}", response_model=ItemRead)
def put_item(
    item_id: int,
    payload: ItemUpdate,
    db: Session = Depends(get_db),
    _: UserProfile = Depends(get_current_user),
) -> ItemRead:
    item = crud.get_item(db, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    updated = crud.update_item(db, item, payload)
    return ItemRead.model_validate(updated)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    _: UserProfile = Depends(get_current_user),
) -> None:
    item = crud.get_item(db, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    crud.delete_item(db, item)
