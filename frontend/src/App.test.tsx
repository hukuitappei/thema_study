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
import { uiCopy } from "./lib/ui-copy";

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
      expect(screen.getByText(uiCopy.auth.status.anonymous)).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: uiCopy.auth.login.title }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(uiCopy.items.list.card.owner("Developer Admin", "admin")),
      ).toBeInTheDocument();
      expect(screen.getByText("#fastapi")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "#fastapi (1)" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(uiCopy.tags.caption(10, null)),
      ).toBeInTheDocument();
      expect(screen.getByText(uiCopy.tags.overflow(8, false))).toBeInTheDocument();
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
      .getByRole("heading", { name: uiCopy.auth.heading })
      .closest("section");
    expect(authSection).not.toBeNull();
    const auth = within(authSection as HTMLElement);
    const loginForm = auth
      .getByRole("button", { name: uiCopy.auth.login.submit })
      .closest("form");
    const registerForm = auth
      .getByRole("button", { name: uiCopy.auth.register.submit })
      .closest("form");
    expect(loginForm).not.toBeNull();
    expect(registerForm).not.toBeNull();

    const login = within(loginForm as HTMLFormElement);
    const register = within(registerForm as HTMLFormElement);

    await user.clear(login.getByLabelText(uiCopy.auth.login.username));
    await user.clear(login.getByLabelText(uiCopy.auth.login.password));
    await user.click(login.getByRole("button", { name: uiCopy.auth.login.submit }));

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("alert")
          .some((element) =>
            element.textContent?.includes(uiCopy.auth.validation.loginUsernameRequired),
          ),
      ).toBe(true);
    });

    await user.type(register.getByLabelText(uiCopy.auth.register.displayName), "New User");
    await user.type(register.getByLabelText(uiCopy.auth.register.username), "ab");
    await user.type(register.getByLabelText(uiCopy.auth.register.password), "secret123");
    await user.click(
      register.getByRole("button", { name: uiCopy.auth.register.submit }),
    );

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("alert")
          .some((element) =>
            element.textContent?.includes(uiCopy.auth.validation.usernameTooShort),
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
    await screen.findByText(uiCopy.auth.status.authenticated);

    expect(
      screen.getAllByRole("button", { name: uiCopy.items.list.card.edit }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("button", { name: uiCopy.items.list.card.delete }),
    ).toHaveLength(1);

    await user.selectOptions(
      screen.getByLabelText(uiCopy.items.list.controls.ownership),
      "mine",
    );
    await waitFor(() => {
      expect(screen.getByText("First item")).toBeInTheDocument();
      expect(screen.queryByText("Alpha item")).not.toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getByLabelText(uiCopy.items.list.controls.ownership),
      "all",
    );
    await user.click(screen.getByRole("button", { name: "#react (1)" }));
    await waitFor(() => {
      expect(screen.getByText("Alpha item")).toBeInTheDocument();
      expect(screen.queryByText("First item")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: uiCopy.tags.all }));
    await user.type(screen.getByLabelText(uiCopy.items.list.controls.search), "react");
    await waitFor(() => {
      expect(screen.getByText("Alpha item")).toBeInTheDocument();
      expect(screen.queryByText("First item")).not.toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(uiCopy.items.list.controls.search));
    await user.type(screen.getByLabelText(uiCopy.items.editor.title), "Created item");
    await user.type(
      screen.getByLabelText(uiCopy.items.editor.description),
      "With tags",
    );
    await user.type(screen.getByLabelText(uiCopy.items.editor.tags), "API, FastAPI, api");
    await user.click(
      screen.getByRole("button", { name: uiCopy.items.editor.createSubmit }),
    );

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

    await user.click(
      screen.getByRole("button", { name: uiCopy.items.list.pagination.previous }),
    );
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

    await screen.findByText(uiCopy.tags.caption(10, "python"));
    expect(screen.getByRole("button", { name: "#python (1)" })).toBeInTheDocument();
    expect(screen.getByText(uiCopy.tags.caption(10, "python"))).toBeInTheDocument();
    expect(
      screen.getByText(uiCopy.items.list.emptyByTag("python")),
    ).toBeInTheDocument();
  });

  it("expands the tag list when more tags are requested", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText(uiCopy.tags.caption(10, null));
    expect(screen.queryByRole("button", { name: "#python (1)" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: uiCopy.tags.more }));

    expect(screen.getByRole("button", { name: "#python (1)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "#sqlalchemy (1)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: uiCopy.tags.less })).toBeInTheDocument();
  });

  it("sorts tags by name when the sort mode is changed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText(uiCopy.tags.caption(10, null));
    await user.selectOptions(screen.getByLabelText(uiCopy.tags.sortLabel), "name");

    const tagButtons = screen
      .getAllByRole("button")
      .map((button) => button.textContent)
      .filter((text): text is string => text?.startsWith("#") ?? false);

    expect(tagButtons.slice(0, 4)).toEqual([
      "#archive (6)",
      "#auth (1)",
      "#backend (1)",
      "#design (1)",
    ]);
  });
});
