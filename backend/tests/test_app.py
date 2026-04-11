import importlib
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import DEV_PASSWORD, DEV_USERNAME
from app.database import Base
from app.main import app
from app.models import User


def auth_headers(
    username: str = DEV_USERNAME, password: str = DEV_PASSWORD
) -> dict[str, str]:
    with TestClient(app) as client:
        login_response = client.post(
            "/api/auth/login",
            json={"username": username, "password": password},
        )
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}


def test_login() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/login",
            json={"username": DEV_USERNAME, "password": DEV_PASSWORD},
        )

        assert response.status_code == 200
        assert response.json()["access_token"]
        assert response.json()["token_type"] == "bearer"


def test_register() -> None:
    with TestClient(app) as client:
        username = f"user_{uuid4().hex[:8]}"
        response = client.post(
            "/api/auth/register",
            json={
                "username": username,
                "display_name": "New User",
                "password": "secret-pass",
            },
        )

        assert response.status_code == 201
        assert response.json()["username"] == username


def test_register_rejects_duplicate_username() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/register",
            json={
                "username": DEV_USERNAME,
                "display_name": "Duplicate",
                "password": "secret-pass",
            },
        )

        assert response.status_code == 409
        assert response.json()["detail"] == "Username already exists"


def test_register_validates_username_display_name_and_password() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/register",
            json={
                "username": "bad name",
                "display_name": "   ",
                "password": "short",
            },
        )

        assert response.status_code == 422
        detail = response.json()["detail"]
        assert any(item["loc"][-1] == "username" for item in detail)
        assert any(item["loc"][-1] == "display_name" for item in detail)
        assert any(item["loc"][-1] == "password" for item in detail)


def test_update_me() -> None:
    with TestClient(app) as client:
        response = client.patch(
            "/api/auth/me",
            json={"display_name": "Updated Admin"},
            headers=auth_headers(),
        )

        assert response.status_code == 200
        assert response.json()["display_name"] == "Updated Admin"


def test_change_password_requires_current_password() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/change-password",
            json={
                "current_password": "wrong-password",
                "new_password": "better-password-123",
            },
            headers=auth_headers(),
        )

        assert response.status_code == 400
        assert response.json()["detail"] == "Current password is incorrect"


def test_seed_user_comes_from_env(monkeypatch) -> None:
    monkeypatch.setenv("THEMA_DEV_USERNAME", "seed-user")
    monkeypatch.setenv("THEMA_DEV_PASSWORD", "seed-password")
    monkeypatch.setenv("THEMA_DEV_DISPLAY_NAME", "Seed User")

    config_module = importlib.import_module("app.config")
    bootstrap_module = importlib.import_module("app.bootstrap")
    importlib.reload(config_module)
    importlib.reload(bootstrap_module)

    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    testing_session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    with testing_session_local() as db:
        bootstrap_module.ensure_seed_data(db)
        seeded_user = db.query(User).filter(User.username == "seed-user").one_or_none()

    assert seeded_user is not None
    assert seeded_user.display_name == "Seed User"


def test_health() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json()["status"] == "ok"


def test_list_tags() -> None:
    with TestClient(app) as client:
        headers = auth_headers()
        first_response = client.post(
            "/api/items",
            json={
                "title": "Tagged 1",
                "description": "First tagged item",
                "tags": ["fastapi", "api"],
            },
            headers=headers,
        )
        assert first_response.status_code == 201

        second_response = client.post(
            "/api/items",
            json={
                "title": "Tagged 2",
                "description": "Second tagged item",
                "tags": ["api", "react"],
            },
            headers=headers,
        )
        assert second_response.status_code == 201

        response = client.get("/api/tags")
        assert response.status_code == 200
        tags = {tag["name"]: tag["item_count"] for tag in response.json()["tags"]}
        assert tags["api"] >= 2
        assert tags["fastapi"] >= 1
        assert tags["react"] >= 1


def test_list_tags_excludes_unused_tags() -> None:
    with TestClient(app) as client:
        headers = auth_headers()
        create_response = client.post(
            "/api/items",
            json={
                "title": "Disposable tag",
                "description": "Will be deleted",
                "tags": ["temporary-tag"],
            },
            headers=headers,
        )
        assert create_response.status_code == 201

        item_id = create_response.json()["id"]

        delete_response = client.delete(f"/api/items/{item_id}", headers=headers)
        assert delete_response.status_code == 204

        response = client.get("/api/tags")
        assert response.status_code == 200
        assert "temporary-tag" not in {
            tag["name"] for tag in response.json()["tags"]
        }


def test_create_and_list_items_with_tags() -> None:
    with TestClient(app) as client:
        create_response = client.post(
            "/api/items",
            json={
                "title": "Hello",
                "description": "World",
                "tags": ["FastAPI", "api", "fastapi"],
            },
            headers=auth_headers(),
        )
        assert create_response.status_code == 201
        assert create_response.json()["owner"]["username"] == DEV_USERNAME
        assert create_response.json()["tags"] == [{"name": "fastapi"}, {"name": "api"}]

        list_response = client.get("/api/items")
        assert list_response.status_code == 200
        body = list_response.json()
        assert body["items"]
        assert body["items"][0]["title"] == "Hello"
        assert body["items"][0]["owner"]["username"] == DEV_USERNAME
        assert body["items"][0]["tags"] == [{"name": "fastapi"}, {"name": "api"}]


def test_update_and_delete_item() -> None:
    with TestClient(app) as client:
        headers = auth_headers()
        create_response = client.post(
            "/api/items",
            json={"title": "Draft", "description": "Before update", "tags": ["draft"]},
            headers=headers,
        )
        item_id = create_response.json()["id"]

        update_response = client.put(
            f"/api/items/{item_id}",
            json={
                "title": "Published",
                "description": "After update",
                "tags": ["release", "api"],
            },
            headers=headers,
        )
        assert update_response.status_code == 200
        assert update_response.json()["title"] == "Published"
        assert update_response.json()["tags"] == [{"name": "release"}, {"name": "api"}]

        delete_response = client.delete(f"/api/items/{item_id}", headers=headers)
        assert delete_response.status_code == 204

        list_response = client.get("/api/items")
        assert all(item["id"] != item_id for item in list_response.json()["items"])


def test_only_owner_can_update_or_delete_item() -> None:
    with TestClient(app) as client:
        owner_headers = auth_headers()
        intruder_username = f"user_{uuid4().hex[:8]}"
        intruder_password = "secret-pass"
        register_response = client.post(
            "/api/auth/register",
            json={
                "username": intruder_username,
                "display_name": "Intruder",
                "password": intruder_password,
            },
        )
        assert register_response.status_code == 201

        intruder_headers = auth_headers(intruder_username, intruder_password)

        create_response = client.post(
            "/api/items",
            json={
                "title": "Owner item",
                "description": "Protected",
                "tags": ["owner-only"],
            },
            headers=owner_headers,
        )
        assert create_response.status_code == 201
        item_id = create_response.json()["id"]

        update_response = client.put(
            f"/api/items/{item_id}",
            json={
                "title": "Hijacked",
                "description": "Should fail",
                "tags": ["intrusion"],
            },
            headers=intruder_headers,
        )
        assert update_response.status_code == 403
        assert (
            update_response.json()["detail"]
            == "You do not have permission to modify this item"
        )

        delete_response = client.delete(
            f"/api/items/{item_id}",
            headers=intruder_headers,
        )
        assert delete_response.status_code == 403
        assert (
            delete_response.json()["detail"]
            == "You do not have permission to modify this item"
        )

        owner_update_response = client.put(
            f"/api/items/{item_id}",
            json={
                "title": "Updated by owner",
                "description": "Allowed",
                "tags": ["allowed"],
            },
            headers=owner_headers,
        )
        assert owner_update_response.status_code == 200

        owner_delete_response = client.delete(
            f"/api/items/{item_id}",
            headers=owner_headers,
        )
        assert owner_delete_response.status_code == 204


def test_mutation_requires_authentication() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/items",
            json={"title": "Unauthorized", "description": "Denied", "tags": []},
        )

        assert response.status_code == 401
