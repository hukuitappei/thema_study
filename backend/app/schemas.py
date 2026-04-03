from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    service: str
    status: str
    version: str


class UserProfile(BaseModel):
    username: str
    display_name: str

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=8, max_length=128)

    model_config = ConfigDict(str_strip_whitespace=True)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserProfile


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_]+$")
    display_name: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=8, max_length=128)

    model_config = ConfigDict(str_strip_whitespace=True)


class UserProfileUpdate(BaseModel):
    display_name: str = Field(min_length=1, max_length=64)

    model_config = ConfigDict(str_strip_whitespace=True)


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class TagRead(BaseModel):
    name: str

    model_config = ConfigDict(from_attributes=True)


class TagSummary(BaseModel):
    name: str
    item_count: int


class TagListResponse(BaseModel):
    tags: list[TagSummary]


class ItemCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str | None = None
    tags: list[str] = Field(default_factory=list, max_length=10)

    model_config = ConfigDict(str_strip_whitespace=True)


class ItemUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str | None = None
    tags: list[str] = Field(default_factory=list, max_length=10)

    model_config = ConfigDict(str_strip_whitespace=True)


class ItemRead(BaseModel):
    id: int
    title: str
    description: str | None = None
    owner: UserProfile
    tags: list[TagRead]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ItemListResponse(BaseModel):
    items: list[ItemRead]
