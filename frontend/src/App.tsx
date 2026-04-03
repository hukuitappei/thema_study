import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { components } from "./generated/schema";
import { TagFilterBar } from "./components/TagFilterBar";
import { apiClient, setAccessToken } from "./lib/api";
import {
  filterAndSortItems,
  formatItemDate,
  parseTagInput,
  type ItemSortKey,
  type OwnershipFilterKey,
} from "./lib/item-utils";
import "./styles.css";

type HealthResponse = components["schemas"]["HealthResponse"];
type Item = components["schemas"]["ItemRead"];
type ItemCreate = components["schemas"]["ItemCreate"];
type UserProfile = components["schemas"]["UserProfile"];
type LoginRequest = components["schemas"]["LoginRequest"];
type PasswordChangeRequest = components["schemas"]["PasswordChangeRequest"];
type RegisterRequest = components["schemas"]["RegisterRequest"];
type TagSummary = components["schemas"]["TagSummary"];
type UserProfileUpdate = components["schemas"]["UserProfileUpdate"];

type AuthMode = "checking" | "anonymous" | "authenticated";

const tokenStorageKey = "thema_auth_token";
const usernamePattern = /^[a-zA-Z0-9_]+$/;

const itemSortOptions: Record<ItemSortKey, string> = {
  newest: "新しい順",
  oldest: "古い順",
  title: "タイトル順",
};

const ownershipFilterOptions: Record<OwnershipFilterKey, string> = {
  all: "全体",
  mine: "自分のアイテム",
};

function getValidationMessage(field: string, message: string) {
  return `${field}: ${message}`;
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [tags, setTags] = useState<TagSummary[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [itemNotice, setItemNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ItemCreate>({
    title: "",
    description: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<ItemSortKey>("newest");
  const [ownershipFilter, setOwnershipFilter] =
    useState<OwnershipFilterKey>("all");
  const [authenticating, setAuthenticating] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("checking");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    username: "admin",
    password: "password123",
  });
  const [registerForm, setRegisterForm] = useState<RegisterRequest>({
    username: "",
    display_name: "",
    password: "",
  });
  const [profileForm, setProfileForm] = useState<UserProfileUpdate>({
    display_name: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordChangeRequest>({
    current_password: "",
    new_password: "",
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [itemError, setItemError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const storedToken = window.localStorage.getItem(tokenStorageKey);

        if (storedToken) {
          setAccessToken(storedToken);
          try {
            const me = await apiClient.getMe();
            if (active) {
              setUser(me);
              setProfileForm({ display_name: me.display_name });
              setAuthMode("authenticated");
              setAuthNotice(`ログイン中: ${me.display_name}`);
            }
          } catch {
            setAccessToken(null);
            window.localStorage.removeItem(tokenStorageKey);
            if (active) {
              setUser(null);
              setAuthMode("anonymous");
              setAuthNotice(
                "保存されていたセッションは無効でした。再度ログインしてください。",
              );
            }
          }
        } else if (active) {
          setAuthMode("anonymous");
        }

        const [healthResponse, itemsResponse, tagsResponse] = await Promise.all([
          apiClient.getHealth(),
          apiClient.listItems(),
          apiClient.listTags(),
        ]);

        if (!active) {
          return;
        }

        setHealth(healthResponse);
        setItems(itemsResponse.items);
        setTags(tagsResponse.tags);
        setPageError(null);
      } catch (cause) {
        if (!active) {
          return;
        }
        const message =
          cause instanceof Error ? cause.message : "読み込みに失敗しました。";
        setPageError(`初期化エラー: ${message}`);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const visibleItems = useMemo(
    () =>
      filterAndSortItems({
        items,
        ownershipFilter,
        currentUsername: user?.username ?? null,
        searchQuery,
        selectedTag,
        sortKey,
      }),
    [items, ownershipFilter, searchQuery, selectedTag, sortKey, user?.username],
  );

  function refreshTagsFromItems(nextItems: Item[]) {
    const counts = new Map<string, number>();
    for (const item of nextItems) {
      for (const tag of item.tags) {
        counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1);
      }
    }

    setTags(
      [...counts.entries()]
        .map(([name, item_count]) => ({ name, item_count }))
        .sort((left, right) => right.item_count - left.item_count || left.name.localeCompare(right.name, "ja")),
    );

    if (selectedTag && !counts.has(selectedTag)) {
      setSelectedTag(null);
    }
  }

  function canManageItem(item: Item) {
    return user?.username === item.owner.username;
  }

  function resetForm() {
    setForm({ title: "", description: "", tags: [] });
    setTagInput("");
    setEditingId(null);
    setItemError(null);
  }

  function validateLoginForm() {
    if (!loginForm.username.trim()) {
      return "ユーザー名を入力してください。";
    }
    if (!loginForm.password) {
      return "パスワードを入力してください。";
    }
    return null;
  }

  function validateRegisterForm() {
    const username = registerForm.username.trim();
    const displayName = registerForm.display_name.trim();
    const password = registerForm.password;

    if (!displayName) {
      return getValidationMessage("表示名", "入力してください。");
    }
    if (displayName.length > 64) {
      return getValidationMessage("表示名", "64文字以内にしてください。");
    }
    if (!username) {
      return getValidationMessage("ユーザー名", "入力してください。");
    }
    if (username.length < 3) {
      return getValidationMessage("ユーザー名", "3文字以上にしてください。");
    }
    if (username.length > 32) {
      return getValidationMessage("ユーザー名", "32文字以内にしてください。");
    }
    if (!usernamePattern.test(username)) {
      return getValidationMessage(
        "ユーザー名",
        "英数字とアンダースコアのみ使用できます。",
      );
    }
    if (!password) {
      return getValidationMessage("パスワード", "入力してください。");
    }
    if (password.length < 8) {
      return getValidationMessage("パスワード", "8文字以上にしてください。");
    }
    if (password.length > 128) {
      return getValidationMessage("パスワード", "128文字以内にしてください。");
    }
    return null;
  }

  function buildItemPayload() {
    return {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      tags: parseTagInput(tagInput),
    };
  }

  function validateItemPayload(payload: ItemCreate) {
    if (!payload.title) {
      return "タイトルは必須です。";
    }
    if (payload.title.length > 120) {
      return "タイトルは120文字以内にしてください。";
    }
    if ((payload.tags ?? []).length > 10) {
      return "タグは10件以内にしてください。";
    }
    return null;
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateLoginForm();
    if (validationError) {
      setLoginError(validationError);
      return;
    }

    try {
      setAuthenticating(true);
      setLoginError(null);
      setAuthNotice(null);

      const response = await apiClient.login({
        username: loginForm.username.trim(),
        password: loginForm.password,
      });

      setAccessToken(response.access_token);
      window.localStorage.setItem(tokenStorageKey, response.access_token);
      setUser(response.user);
      setProfileForm({ display_name: response.user.display_name });
      setAuthMode("authenticated");
      setAuthNotice(`ログインしました: ${response.user.display_name}`);
      setPageError(null);
    } catch (cause) {
      setUser(null);
      setAuthMode("anonymous");
      setAccessToken(null);
      window.localStorage.removeItem(tokenStorageKey);
      const message =
        cause instanceof Error ? cause.message : "ログインに失敗しました。";
      setLoginError(message);
    } finally {
      setAuthenticating(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateRegisterForm();
    if (validationError) {
      setRegisterError(validationError);
      return;
    }

    try {
      setRegistering(true);
      setRegisterError(null);
      setAuthNotice(null);

      const created = await apiClient.register({
        username: registerForm.username.trim(),
        display_name: registerForm.display_name.trim(),
        password: registerForm.password,
      });

      setLoginForm({
        username: created.username,
        password: registerForm.password,
      });
      setRegisterForm({ username: "", display_name: "", password: "" });
      setAuthNotice(
        `${created.display_name} を登録しました。続けてログインしてください。`,
      );
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "ユーザー登録に失敗しました。";
      setRegisterError(message);
    } finally {
      setRegistering(false);
    }
  }

  function handleLogout() {
    setAccessToken(null);
    window.localStorage.removeItem(tokenStorageKey);
    setUser(null);
    setProfileForm({ display_name: "" });
    setPasswordForm({ current_password: "", new_password: "" });
    setAuthMode("anonymous");
    setAuthNotice("ログアウトしました。");
    resetForm();
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profileForm.display_name.trim()) {
      setProfileError("表示名を入力してください。");
      return;
    }

    try {
      setProfileBusy(true);
      setProfileError(null);
      const updated = await apiClient.updateMe({
        display_name: profileForm.display_name.trim(),
      });
      setUser(updated);
      setProfileForm({ display_name: updated.display_name });
      setAuthNotice(`プロフィールを更新しました: ${updated.display_name}`);
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "プロフィール更新に失敗しました。";
      setProfileError(message);
    } finally {
      setProfileBusy(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordForm.current_password || !passwordForm.new_password) {
      setPasswordError("現在のパスワードと新しいパスワードを入力してください。");
      return;
    }

    try {
      setPasswordBusy(true);
      setPasswordError(null);
      await apiClient.changePassword(passwordForm);
      setAccessToken(null);
      window.localStorage.removeItem(tokenStorageKey);
      setUser(null);
      setAuthMode("anonymous");
      setPasswordForm({ current_password: "", new_password: "" });
      setAuthNotice("パスワードを変更しました。再度ログインしてください。");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "パスワード変更に失敗しました。";
      setPasswordError(message);
    } finally {
      setPasswordBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildItemPayload();
    const validationError = validateItemPayload(payload);
    if (validationError) {
      setItemError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setItemError(null);
      setPageError(null);

      let nextItems: Item[];
      if (editingId === null) {
        const created = await apiClient.createItem(payload);
        nextItems = [created, ...items];
        setItems(nextItems);
        setItemNotice("アイテムを追加しました。");
      } else {
        const updated = await apiClient.updateItem(editingId, payload);
        nextItems = items.map((item) => (item.id === updated.id ? updated : item));
        setItems(nextItems);
        setItemNotice("アイテムを更新しました。");
      }

      refreshTagsFromItems(nextItems);
      resetForm();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "アイテム操作に失敗しました。";
      setItemError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(item: Item) {
    setEditingId(item.id);
    setItemError(null);
    setItemNotice(null);
    setForm({
      title: item.title,
      description: item.description ?? "",
      tags: item.tags.map((tag) => tag.name),
    });
    setTagInput(item.tags.map((tag) => tag.name).join(", "));
  }

  async function handleDelete(itemId: number) {
    try {
      setItemError(null);
      setItemNotice(null);
      await apiClient.deleteItem(itemId);
      const nextItems = items.filter((item) => item.id !== itemId);
      setItems(nextItems);
      if (editingId === itemId) {
        resetForm();
      }
      refreshTagsFromItems(nextItems);
      setItemNotice("アイテムを削除しました。");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "アイテム削除に失敗しました。";
      setItemError(message);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">TypeScript + Python foundation</p>
        <h1>FastAPI と React の型安全な疎通を先に成立させる</h1>
        <p className="lead">
          バックエンドの OpenAPI を正として、フロントエンドは生成型を使って通信します。
        </p>
      </section>

      <section className="panel">
        <header className="panel-header">
          <h2>API 状態</h2>
        </header>
        {loading ? <p>読み込み中...</p> : null}
        {pageError ? (
          <p className="error" role="alert">
            {pageError}
          </p>
        ) : null}
        {!loading && !pageError && health ? (
          <dl className="status-grid" aria-label="API status">
            <div>
              <dt>Status</dt>
              <dd>{health.status}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{health.service}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{health.version}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="panel">
        <header className="panel-header">
          <h2>認証</h2>
          <span>
            {authMode === "checking"
              ? "セッション確認中"
              : authMode === "authenticated"
                ? "認証済み"
                : "未認証"}
          </span>
          {user ? (
            <button className="ghost-button" onClick={handleLogout} type="button">
              ログアウト
            </button>
          ) : null}
        </header>
        {authNotice ? (
          <p className="notice" role="status">
            {authNotice}
          </p>
        ) : null}
        {user ? (
          <div className="auth-summary">
            <strong>{user.display_name}</strong>
            <p>@{user.username} としてアイテム操作が可能です。</p>
          </div>
        ) : (
          <div className="auth-grid">
            <form className="item-form" onSubmit={handleLogin} noValidate>
              <h3>ログイン</h3>
              <label>
                <span>ユーザー名</span>
                <input
                  autoComplete="username"
                  minLength={3}
                  value={loginForm.username}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>パスワード</span>
                <input
                  autoComplete="current-password"
                  type="password"
                  minLength={8}
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </label>
              {loginError ? (
                <p className="error" role="alert">
                  {loginError}
                </p>
              ) : null}
              <button
                className="primary-button"
                disabled={authenticating}
                type="submit"
              >
                {authenticating ? "ログイン中..." : "ログイン"}
              </button>
            </form>

            <form className="item-form" onSubmit={handleRegister} noValidate>
              <h3>ユーザー登録</h3>
              <label>
                <span>表示名</span>
                <input
                  autoComplete="name"
                  maxLength={64}
                  value={registerForm.display_name}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      display_name: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>ユーザー名</span>
                <input
                  autoComplete="username"
                  maxLength={32}
                  value={registerForm.username}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>パスワード</span>
                <input
                  autoComplete="new-password"
                  type="password"
                  minLength={8}
                  maxLength={128}
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </label>
              {registerError ? (
                <p className="error" role="alert">
                  {registerError}
                </p>
              ) : null}
              <button
                className="ghost-button"
                disabled={registering}
                type="submit"
              >
                {registering ? "登録中..." : "ユーザー登録"}
              </button>
            </form>
          </div>
        )}
      </section>

      {user ? (
        <section className="panel">
          <header className="panel-header">
            <h2>アカウント設定</h2>
          </header>
          <div className="auth-grid">
            <form className="item-form" onSubmit={handleProfileSubmit} noValidate>
              <h3>プロフィール更新</h3>
              <label>
                <span>表示名</span>
                <input
                  maxLength={64}
                  value={profileForm.display_name}
                  onChange={(event) =>
                    setProfileForm({ display_name: event.target.value })
                  }
                />
              </label>
              {profileError ? (
                <p className="error" role="alert">
                  {profileError}
                </p>
              ) : null}
              <button className="ghost-button" disabled={profileBusy} type="submit">
                {profileBusy ? "更新中..." : "プロフィール更新"}
              </button>
            </form>

            <form className="item-form" onSubmit={handlePasswordSubmit} noValidate>
              <h3>パスワード変更</h3>
              <label>
                <span>現在のパスワード</span>
                <input
                  autoComplete="current-password"
                  type="password"
                  minLength={8}
                  maxLength={128}
                  value={passwordForm.current_password}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      current_password: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>新しいパスワード</span>
                <input
                  autoComplete="new-password"
                  type="password"
                  minLength={8}
                  maxLength={128}
                  value={passwordForm.new_password}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      new_password: event.target.value,
                    }))
                  }
                />
              </label>
              {passwordError ? (
                <p className="error" role="alert">
                  {passwordError}
                </p>
              ) : null}
              <button className="ghost-button" disabled={passwordBusy} type="submit">
                {passwordBusy ? "変更中..." : "パスワード変更"}
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <header className="panel-header">
          <h2>{editingId === null ? "アイテム追加" : "アイテム編集"}</h2>
          {editingId !== null ? (
            <button className="ghost-button" onClick={resetForm} type="button">
              キャンセル
            </button>
          ) : null}
        </header>
        {user ? (
          <form className="item-form" onSubmit={handleSubmit} noValidate>
            <label>
              <span>タイトル</span>
              <input
                aria-label="タイトル"
                maxLength={120}
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="例: API contract を更新する"
              />
            </label>
            <label>
              <span>説明</span>
              <textarea
                aria-label="説明"
                rows={4}
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="背景や対応内容をメモする"
              />
            </label>
            <label>
              <span>タグ</span>
              <input
                aria-label="タグ"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                placeholder="例: api, fastapi, auth"
              />
            </label>
            {itemError ? (
              <p className="error" role="alert">
                {itemError}
              </p>
            ) : null}
            {itemNotice ? (
              <p className="notice" role="status">
                {itemNotice}
              </p>
            ) : null}
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? "送信中..." : editingId === null ? "追加する" : "更新する"}
            </button>
          </form>
        ) : (
          <p>アイテムの追加・編集・削除にはログインが必要です。</p>
        )}
      </section>

      <section className="panel">
        <header className="panel-header">
          <h2>サンプルデータ</h2>
          <span>{visibleItems.length} items</span>
        </header>

        <TagFilterBar
          tags={tags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />

        <div className="list-controls">
          {user ? (
            <label className="control-field">
              <span>表示範囲</span>
              <select
                aria-label="表示範囲"
                value={ownershipFilter}
                onChange={(event) =>
                  setOwnershipFilter(event.target.value as OwnershipFilterKey)
                }
              >
                {Object.entries(ownershipFilterOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="control-field">
            <span>検索</span>
            <input
              aria-label="検索"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="タイトル・説明・タグで絞り込む"
            />
          </label>
          <label className="control-field">
            <span>並び順</span>
            <select
              aria-label="並び順"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as ItemSortKey)}
            >
              {Object.entries(itemSortOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ul className="item-list">
          {visibleItems.map((item) => (
            <li key={item.id} className="item-card">
              <strong>{item.title}</strong>
              <p className="item-owner">
                作成者: {item.owner.display_name} (@{item.owner.username})
              </p>
              <time className="item-timestamp" dateTime={item.created_at}>
                {formatItemDate(item.created_at)}
              </time>
              {item.tags.length ? (
                <div className="item-tags">
                  {item.tags.map((tag) => (
                    <span key={tag.name} className="tag-chip">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              ) : null}
              <p>{item.description ?? "説明はありません。"}</p>
              {canManageItem(item) ? (
                <div className="item-actions">
                  <button
                    className="ghost-button"
                    onClick={() => handleEdit(item)}
                    type="button"
                  >
                    編集
                  </button>
                  <button
                    className="danger-button"
                    onClick={() => void handleDelete(item.id)}
                    type="button"
                  >
                    削除
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        {!visibleItems.length ? (
          <p className="empty-state">
            {selectedTag
              ? `#${selectedTag} に一致するアイテムはありません。`
              : ownershipFilter === "mine"
                ? "自分のアイテムはまだありません。"
                : "条件に一致するアイテムはありません。"}
          </p>
        ) : null}
      </section>
    </main>
  );
}
