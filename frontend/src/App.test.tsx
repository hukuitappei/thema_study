import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
    updateMe: vi.fn().mockResolvedValue({
      username: "admin",
      display_name: "Updated Admin",
    }),
    changePassword: vi.fn().mockResolvedValue(undefined),
    getMe: vi.fn().mockResolvedValue({
      username: "admin",
      display_name: "Developer Admin",
    }),
    getHealth: vi.fn().mockResolvedValue({
      status: "ok",
      service: "thema-backend",
      version: "0.1.0",
    }),
    listTags: vi.fn().mockResolvedValue({
      tags: [
        { name: "archive", item_count: 6 },
        { name: "fastapi", item_count: 1 },
        { name: "react", item_count: 1 },
        { name: "backend", item_count: 1 },
        { name: "design", item_count: 1 },
        { name: "testing", item_count: 1 },
        { name: "auth", item_count: 1 },
        { name: "typescript", item_count: 1 },
        { name: "python", item_count: 1 },
        { name: "sqlalchemy", item_count: 1 },
      ],
    }),
    listItems: vi.fn().mockResolvedValue({
      items: [
        {
          id: 1,
          title: "First item",
          description: "From test",
          owner: {
            username: "admin",
            display_name: "Developer Admin",
          },
          tags: [{ name: "fastapi" }, { name: "backend" }],
          created_at: "2026-04-02T00:00:00Z",
        },
        {
          id: 2,
          title: "Alpha item",
          description: "Second entry",
          owner: {
            username: "newuser",
            display_name: "New User",
          },
          tags: [{ name: "react" }],
          created_at: "2026-04-03T00:00:00Z",
        },
        {
          id: 3,
          title: "Older item 1",
          description: "Archive entry 1",
          owner: {
            username: "guest1",
            display_name: "Guest One",
          },
          tags: [{ name: "archive" }],
          created_at: "2026-03-01T00:00:00Z",
        },
        {
          id: 4,
          title: "Older item 2",
          description: "Archive entry 2",
          owner: {
            username: "guest2",
            display_name: "Guest Two",
          },
          tags: [{ name: "archive" }],
          created_at: "2026-03-02T00:00:00Z",
        },
        {
          id: 5,
          title: "Older item 3",
          description: "Archive entry 3",
          owner: {
            username: "guest3",
            display_name: "Guest Three",
          },
          tags: [{ name: "archive" }],
          created_at: "2026-03-03T00:00:00Z",
        },
        {
          id: 6,
          title: "Older item 4",
          description: "Archive entry 4",
          owner: {
            username: "guest4",
            display_name: "Guest Four",
          },
          tags: [{ name: "archive" }],
          created_at: "2026-03-04T00:00:00Z",
        },
        {
          id: 7,
          title: "Older item 5",
          description: "Archive entry 5",
          owner: {
            username: "guest5",
            display_name: "Guest Five",
          },
          tags: [{ name: "archive" }],
          created_at: "2026-03-05T00:00:00Z",
        },
        {
          id: 8,
          title: "Older item 6",
          description: "Archive entry 6",
          owner: {
            username: "guest6",
            display_name: "Guest Six",
          },
          tags: [{ name: "archive" }],
          created_at: "2026-03-06T00:00:00Z",
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

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
  apiMocks.createItem.mockReset();
  apiMocks.updateItem.mockReset();
  apiMocks.deleteItem.mockReset();
});

describe("App", () => {
  it("renders api status and tags", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("ok")).toBeInTheDocument();
      expect(screen.getByText("未認証")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "ログイン" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("作成者: Developer Admin (@admin)"),
      ).toBeInTheDocument();
      expect(screen.getByText("#fastapi")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "#fastapi (1)" }),
      ).toBeInTheDocument();
      expect(screen.getByText("10 tags available / 現在: すべて")).toBeInTheDocument();
      expect(screen.getByText("上位 8 件を表示中")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "#python (1)" }),
      ).not.toBeInTheDocument();
    });
  });

  it("shows client-side validation for login and registration", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText("ok");

    const authSection = screen
      .getByRole("heading", { name: "認証" })
      .closest("section");
    expect(authSection).not.toBeNull();
    const auth = within(authSection as HTMLElement);
    const loginForm = auth
      .getByRole("button", { name: "ログイン" })
      .closest("form");
    const registerForm = auth
      .getByRole("button", { name: "ユーザー登録" })
      .closest("form");
    expect(loginForm).not.toBeNull();
    expect(registerForm).not.toBeNull();

    const login = within(loginForm as HTMLFormElement);
    const register = within(registerForm as HTMLFormElement);

    await user.clear(login.getByLabelText("ユーザー名"));
    await user.clear(login.getByLabelText("パスワード"));
    await user.click(login.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("alert")
          .some((element) =>
            element.textContent?.includes("ユーザー名を入力してください。"),
          ),
      ).toBe(true);
    });

    await user.type(register.getByLabelText("表示名"), "New User");
    await user.type(register.getByLabelText("ユーザー名"), "ab");
    await user.type(register.getByLabelText("パスワード"), "secret123");
    await user.click(register.getByRole("button", { name: "ユーザー登録" }));

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("alert")
          .some((element) =>
            element.textContent?.includes("ユーザー名: 3文字以上にしてください。"),
          ),
      ).toBe(true);
    });
  });

  it("filters items by owner, tag, and search, and submits parsed tags", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("thema_auth_token", "dev-access-token");
    apiMocks.createItem.mockResolvedValue({
      id: 3,
      title: "Created item",
      description: "With tags",
      owner: {
        username: "admin",
        display_name: "Developer Admin",
      },
      tags: [{ name: "api" }, { name: "fastapi" }],
      created_at: "2026-04-04T00:00:00Z",
    });

    render(<App />);

    await screen.findByText("First item");
    await screen.findByText("認証済み");

    expect(screen.getAllByRole("button", { name: "編集" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "削除" })).toHaveLength(1);

    await user.selectOptions(screen.getByLabelText("表示範囲"), "mine");
    await waitFor(() => {
      expect(screen.getByText("First item")).toBeInTheDocument();
      expect(screen.queryByText("Alpha item")).not.toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText("表示範囲"), "all");
    await user.click(screen.getByRole("button", { name: "#react (1)" }));
    await waitFor(() => {
      expect(screen.getByText("Alpha item")).toBeInTheDocument();
      expect(screen.queryByText("First item")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "すべて" }));
    await user.type(screen.getByLabelText("検索"), "react");
    await waitFor(() => {
      expect(screen.getByText("Alpha item")).toBeInTheDocument();
      expect(screen.queryByText("First item")).not.toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText("検索"));
    await user.type(screen.getByLabelText("タイトル"), "Created item");
    await user.type(screen.getByLabelText("説明"), "With tags");
    await user.type(screen.getByLabelText("タグ"), "API, FastAPI, api");
    await user.click(screen.getByRole("button", { name: "追加する" }));

    await waitFor(() => {
      expect(apiMocks.createItem).toHaveBeenCalledWith({
        title: "Created item",
        description: "With tags",
        tags: ["api", "fastapi"],
      });
    });
  });

  it("restores list state from the URL and paginates visible items", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("thema_auth_token", "dev-access-token");
    window.history.replaceState({}, "", "/?q=item&sort=oldest&page=2");

    render(<App />);

    await screen.findByText("First item");
    expect(screen.getByDisplayValue("item")).toBeInTheDocument();
    expect(screen.queryByText("Older item 1")).not.toBeInTheDocument();
    expect(window.location.search).toContain("sort=oldest");
    expect(window.location.search).toContain("page=2");

    await user.click(screen.getByRole("button", { name: "Previous" }));
    await waitFor(() => {
      expect(screen.getByText("Older item 1")).toBeInTheDocument();
    });
    expect(window.location.search).not.toContain("page=2");

    await user.click(screen.getByRole("button", { name: "#react (1)" }));
    await waitFor(() => {
      expect(screen.getByText("Alpha item")).toBeInTheDocument();
      expect(screen.queryByText("Older item 1")).not.toBeInTheDocument();
    });
    expect(window.location.search).toContain("tag=react");
  });

  it("keeps the selected tag visible even when it is outside the default top tags", async () => {
    window.localStorage.setItem("thema_auth_token", "dev-access-token");
    window.history.replaceState({}, "", "/?tag=python");

    render(<App />);

    await screen.findByText("10 tags available / 現在: #python");
    expect(screen.getByRole("button", { name: "#python (1)" })).toBeInTheDocument();
    expect(screen.getByText("10 tags available / 現在: #python")).toBeInTheDocument();
    expect(screen.getByText("#python に一致するアイテムはありません。")).toBeInTheDocument();
  });
});
