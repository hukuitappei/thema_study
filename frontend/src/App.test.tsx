import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const apiMocks = vi.hoisted(() => ({
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

vi.mock("./lib/api", () => ({
  setAccessToken: vi.fn(),
  apiClient: {
    login: vi.fn().mockResolvedValue({
      access_token: "dev-access-token",
      token_type: "bearer",
      user: {
        username: "admin",
        display_name: "Developer Admin",
      },
    }),
    register: vi.fn().mockResolvedValue({
      username: "newuser",
      display_name: "New User",
    }),
    getMe: vi.fn().mockRejectedValue(new Error("not logged in")),
    getHealth: vi.fn().mockResolvedValue({
      status: "ok",
      service: "thema-backend",
      version: "0.1.0",
    }),
    listItems: vi.fn().mockResolvedValue({
      items: [
        {
          id: 1,
          title: "First item",
          description: "From test",
          created_at: "2026-04-02T00:00:00Z",
        },
      ],
    }),
    createItem: apiMocks.createItem,
    updateItem: apiMocks.updateItem,
    deleteItem: apiMocks.deleteItem,
  },
}));

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("renders API data", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("ok")).toBeInTheDocument();
      expect(screen.getByText("First item")).toBeInTheDocument();
    });
  });

  it("renders create form actions", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "ログイン" }).length).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: "ユーザー登録" })).toBeInTheDocument();
      expect(
        screen.getByText("アイテムの追加・編集・削除にはログインが必要です。"),
      ).toBeInTheDocument();
    });
  });
});
