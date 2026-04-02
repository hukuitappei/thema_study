import { useEffect, useState } from "react";
import { apiClient, setAccessToken } from "./lib/api";
import type { components } from "./generated/schema";

type HealthResponse = components["schemas"]["HealthResponse"];
type Item = components["schemas"]["ItemRead"];
type ItemCreate = components["schemas"]["ItemCreate"];
type UserProfile = components["schemas"]["UserProfile"];
type LoginRequest = components["schemas"]["LoginRequest"];
type RegisterRequest = components["schemas"]["RegisterRequest"];

const tokenStorageKey = "thema_auth_token";

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ItemCreate>({ title: "", description: "" });
  const [authenticating, setAuthenticating] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    username: "admin",
    password: "password123",
  });
  const [registering, setRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterRequest>({
    username: "",
    display_name: "",
    password: "",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const storedToken = window.localStorage.getItem(tokenStorageKey);
        if (storedToken) {
          setAccessToken(storedToken);
          const me = await apiClient.getMe();
          if (active) {
            setUser(me);
          }
        }

        const [healthResponse, itemsResponse] = await Promise.all([
          apiClient.getHealth(),
          apiClient.listItems(),
        ]);

        if (!active) {
          return;
        }

        setHealth(healthResponse);
        setItems(itemsResponse.items);
        setError(null);
      } catch (cause) {
        if (!active) {
          return;
        }

        const message =
          cause instanceof Error ? cause.message : "Unknown error";
        setError(message);
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

  function updateForm<K extends keyof ItemCreate>(key: K, value: ItemCreate[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateLoginForm<K extends keyof LoginRequest>(
    key: K,
    value: LoginRequest[K],
  ) {
    setLoginForm((current) => ({ ...current, [key]: value }));
  }

  function updateRegisterForm<K extends keyof RegisterRequest>(
    key: K,
    value: RegisterRequest[K],
  ) {
    setRegisterForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm({ title: "", description: "" });
    setEditingId(null);
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setAuthenticating(true);
      setError(null);
      const response = await apiClient.login(loginForm);
      setAccessToken(response.access_token);
      window.localStorage.setItem(tokenStorageKey, response.access_token);
      setUser(response.user);
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Unknown error";
      setError(message);
    } finally {
      setAuthenticating(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setRegistering(true);
      setError(null);
      const created = await apiClient.register(registerForm);
      setLoginForm({
        username: created.username,
        password: registerForm.password,
      });
      setRegisterForm({
        username: "",
        display_name: "",
        password: "",
      });
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Unknown error";
      setError(message);
    } finally {
      setRegistering(false);
    }
  }

  function handleLogout() {
    setAccessToken(null);
    window.localStorage.removeItem(tokenStorageKey);
    setUser(null);
    resetForm();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
    };

    if (!payload.title) {
      setError("タイトルは必須です。");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingId === null) {
        const created = await apiClient.createItem(payload);
        setItems((current) => [created, ...current]);
      } else {
        const updated = await apiClient.updateItem(editingId, payload);
        setItems((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      }

      resetForm();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Unknown error";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(item: Item) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
    });
  }

  async function handleDelete(itemId: number) {
    try {
      setError(null);
      await apiClient.deleteItem(itemId);
      setItems((current) => current.filter((item) => item.id !== itemId));
      if (editingId === itemId) {
        resetForm();
      }
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Unknown error";
      setError(message);
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
        {error ? <p className="error">接続エラー: {error}</p> : null}
        {!loading && !error && health ? (
          <dl className="status-grid">
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
          <h2>{user ? "認証状態" : "ログイン"}</h2>
          {user ? (
            <button className="ghost-button" onClick={handleLogout} type="button">
              ログアウト
            </button>
          ) : null}
        </header>
        {user ? (
          <div className="auth-summary">
            <strong>{user.display_name}</strong>
            <p>@{user.username} としてアイテム操作が可能です。</p>
          </div>
        ) : (
          <div className="auth-grid">
            <form className="item-form" onSubmit={handleLogin}>
              <label>
                <span>ユーザー名</span>
                <input
                  value={loginForm.username}
                  onChange={(event) =>
                    updateLoginForm("username", event.target.value)
                  }
                />
              </label>
              <label>
                <span>パスワード</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    updateLoginForm("password", event.target.value)
                  }
                />
              </label>
              <button
                className="primary-button"
                disabled={authenticating}
                type="submit"
              >
                {authenticating ? "認証中..." : "ログイン"}
              </button>
            </form>

            <form className="item-form" onSubmit={handleRegister}>
              <label>
                <span>表示名</span>
                <input
                  value={registerForm.display_name}
                  onChange={(event) =>
                    updateRegisterForm("display_name", event.target.value)
                  }
                />
              </label>
              <label>
                <span>ユーザー名</span>
                <input
                  value={registerForm.username}
                  onChange={(event) =>
                    updateRegisterForm("username", event.target.value)
                  }
                />
              </label>
              <label>
                <span>パスワード</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    updateRegisterForm("password", event.target.value)
                  }
                />
              </label>
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
          <form className="item-form" onSubmit={handleSubmit}>
            <label>
              <span>タイトル</span>
              <input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="例: API contractを更新する"
              />
            </label>
            <label>
              <span>説明</span>
              <textarea
                rows={4}
                value={form.description ?? ""}
                onChange={(event) => updateForm("description", event.target.value)}
                placeholder="フロントとバックエンドの疎通確認用タスク"
              />
            </label>
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
          <span>{items.length} items</span>
        </header>
        <ul className="item-list">
          {items.map((item) => (
            <li key={item.id} className="item-card">
              <strong>{item.title}</strong>
              <p>{item.description ?? "説明なし"}</p>
              {user ? (
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
      </section>
    </main>
  );
}
