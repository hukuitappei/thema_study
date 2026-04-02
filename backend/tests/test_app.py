from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


def auth_headers() -> dict[str, str]:
    with TestClient(app) as client:
        login_response = client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "password123"},
        )
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}


def test_login() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "password123"},
        )

        assert response.status_code == 200
        assert response.json()["access_token"]
        assert response.json()["token_type"] == "bearer"


def test_register() -> None:
    with TestClient(app) as client:
        username = f"user-{uuid4().hex[:8]}"
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


def test_health() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json()["status"] == "ok"


def test_create_and_list_items() -> None:
    with TestClient(app) as client:
        create_response = client.post(
            "/api/items",
            json={"title": "Hello", "description": "World"},
            headers=auth_headers(),
        )
        assert create_response.status_code == 201

        list_response = client.get("/api/items")
        assert list_response.status_code == 200
        body = list_response.json()
        assert body["items"]
        assert body["items"][0]["title"] == "Hello"


def test_update_and_delete_item() -> None:
    with TestClient(app) as client:
        headers = auth_headers()
        create_response = client.post(
            "/api/items",
            json={"title": "Draft", "description": "Before update"},
            headers=headers,
        )
        item_id = create_response.json()["id"]

        update_response = client.put(
            f"/api/items/{item_id}",
            json={"title": "Published", "description": "After update"},
            headers=headers,
        )
        assert update_response.status_code == 200
        assert update_response.json()["title"] == "Published"

        delete_response = client.delete(f"/api/items/{item_id}", headers=headers)
        assert delete_response.status_code == 204

        list_response = client.get("/api/items")
        assert all(item["id"] != item_id for item in list_response.json()["items"])


def test_mutation_requires_authentication() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/items",
            json={"title": "Unauthorized", "description": "Denied"},
        )

        assert response.status_code == 401
