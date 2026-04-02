from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    service: str
    status: str
    version: str


class UserProfile(BaseModel):
    username: str
    display_name: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserProfile


class RegisterRequest(BaseModel):
    username: str
    display_name: str
    password: str


class ItemCreate(BaseModel):
    title: str
    description: str | None = None


class ItemUpdate(BaseModel):
    title: str
    description: str | None = None


class ItemRead(BaseModel):
    id: int
    title: str
    description: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ItemListResponse(BaseModel):
    items: list[ItemRead]
