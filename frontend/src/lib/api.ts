import { apiBaseUrl } from "./config";
import type { components } from "../generated/schema";

type HealthResponse = components["schemas"]["HealthResponse"];
type ItemCreate = components["schemas"]["ItemCreate"];
type ItemListResponse = components["schemas"]["ItemListResponse"];
type ItemRead = components["schemas"]["ItemRead"];
type LoginRequest = components["schemas"]["LoginRequest"];
type LoginResponse = components["schemas"]["LoginResponse"];
type RegisterRequest = components["schemas"]["RegisterRequest"];
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
    throw new Error(`Request failed: ${response.status}`);
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
  getHealth() {
    return request<HealthResponse>("/health");
  },
  listItems() {
    return request<ItemListResponse>("/api/items");
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
