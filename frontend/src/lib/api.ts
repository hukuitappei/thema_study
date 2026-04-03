import { apiBaseUrl } from "./config";
import type { components } from "../generated/schema";

type HealthResponse = components["schemas"]["HealthResponse"];
type ItemCreate = components["schemas"]["ItemCreate"];
type ItemListResponse = components["schemas"]["ItemListResponse"];
type ItemRead = components["schemas"]["ItemRead"];
type LoginRequest = components["schemas"]["LoginRequest"];
type LoginResponse = components["schemas"]["LoginResponse"];
type PasswordChangeRequest = components["schemas"]["PasswordChangeRequest"];
type RegisterRequest = components["schemas"]["RegisterRequest"];
type TagListResponse = components["schemas"]["TagListResponse"];
type UserProfileUpdate = components["schemas"]["UserProfileUpdate"];
type UserProfile = components["schemas"]["UserProfile"];

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const body = (await response.json()) as {
        detail?: string | { msg?: string }[] | string[];
      };
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail) && body.detail.length > 0) {
        const first = body.detail[0];
        if (typeof first === "string") {
          message = first;
        } else if (first && typeof first === "object" && "msg" in first) {
          message = first.msg ?? message;
        }
      }
    } catch {
      // Keep the HTTP status fallback when the body is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  login(payload: LoginRequest) {
    return request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  register(payload: RegisterRequest) {
    return request<UserProfile>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getMe() {
    return request<UserProfile>("/api/auth/me");
  },
  updateMe(payload: UserProfileUpdate) {
    return request<UserProfile>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  async changePassword(payload: PasswordChangeRequest) {
    await request<undefined>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getHealth() {
    return request<HealthResponse>("/health");
  },
  listItems() {
    return request<ItemListResponse>("/api/items");
  },
  listTags() {
    return request<TagListResponse>("/api/tags");
  },
  createItem(payload: ItemCreate) {
    return request<ItemRead>("/api/items", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateItem(itemId: number, payload: ItemCreate) {
    return request<ItemRead>(`/api/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  async deleteItem(itemId: number) {
    await request<undefined>(`/api/items/${itemId}`, {
      method: "DELETE",
    });
  },
};
