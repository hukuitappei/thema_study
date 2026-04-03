from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import (
    change_password as change_password_for_user,
    get_current_user,
    get_user_by_username,
    login as login_user,
    register as register_user,
    update_profile as update_profile_for_user,
)
from app import crud
from app.database import get_db
from app.schemas import (
    ItemCreate,
    ItemListResponse,
    ItemRead,
    ItemUpdate,
    LoginRequest,
    LoginResponse,
    PasswordChangeRequest,
    RegisterRequest,
    TagListResponse,
    TagSummary,
    UserProfile,
    UserProfileUpdate,
)

router = APIRouter(prefix="/api/items", tags=["items"])
tags_router = APIRouter(prefix="/api/tags", tags=["tags"])
auth_router = APIRouter(prefix="/api/auth", tags=["auth"])


def ensure_item_owner(item_owner_username: str, current_username: str) -> None:
    if item_owner_username != current_username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this item",
        )


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


@auth_router.patch("/me", response_model=UserProfile)
def update_me(
    payload: UserProfileUpdate,
    user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfile:
    return update_profile_for_user(user.username, payload, db)


@auth_router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordChangeRequest,
    user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    change_password_for_user(user.username, payload, db)


@router.get("", response_model=ItemListResponse)
def get_items(db: Session = Depends(get_db)) -> ItemListResponse:
    items = crud.list_items(db)
    return ItemListResponse(items=items)


@tags_router.get("", response_model=TagListResponse)
def get_tags(db: Session = Depends(get_db)) -> TagListResponse:
    tags = [TagSummary(**tag) for tag in crud.list_tags(db)]
    return TagListResponse(tags=tags)


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def post_item(
    payload: ItemCreate,
    db: Session = Depends(get_db),
    user: UserProfile = Depends(get_current_user),
) -> ItemRead:
    owner = get_user_by_username(user.username, db)
    item = crud.create_item(db, payload, owner)
    return ItemRead.model_validate(item)


@router.put("/{item_id}", response_model=ItemRead)
def put_item(
    item_id: int,
    payload: ItemUpdate,
    db: Session = Depends(get_db),
    user: UserProfile = Depends(get_current_user),
) -> ItemRead:
    item = crud.get_item(db, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    ensure_item_owner(item.owner.username, user.username)

    updated = crud.update_item(db, item, payload)
    return ItemRead.model_validate(updated)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: UserProfile = Depends(get_current_user),
) -> None:
    item = crud.get_item(db, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    ensure_item_owner(item.owner.username, user.username)

    crud.delete_item(db, item)
