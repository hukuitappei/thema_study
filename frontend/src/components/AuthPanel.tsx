import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { components } from "../generated/schema";
import { uiCopy } from "../lib/ui-copy";

type LoginRequest = components["schemas"]["LoginRequest"];
type RegisterRequest = components["schemas"]["RegisterRequest"];
type UserProfile = components["schemas"]["UserProfile"];

type AuthMode = "checking" | "anonymous" | "authenticated";

type AuthPanelProps = {
  authMode: AuthMode;
  authNotice: string | null;
  authenticating: boolean;
  handleLogin: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleLogout: () => void;
  handleRegister: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  loginError: string | null;
  loginForm: LoginRequest;
  registering: boolean;
  registerError: string | null;
  registerForm: RegisterRequest;
  setLoginForm: Dispatch<SetStateAction<LoginRequest>>;
  setRegisterForm: Dispatch<SetStateAction<RegisterRequest>>;
  user: UserProfile | null;
};

export function AuthPanel({
  authMode,
  authNotice,
  authenticating,
  handleLogin,
  handleLogout,
  handleRegister,
  loginError,
  loginForm,
  registering,
  registerError,
  registerForm,
  setLoginForm,
  setRegisterForm,
  user,
}: AuthPanelProps) {
  const statusLabel =
    authMode === "checking"
      ? uiCopy.auth.status.checking
      : authMode === "authenticated"
        ? uiCopy.auth.status.authenticated
        : uiCopy.auth.status.anonymous;

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{uiCopy.auth.heading}</h2>
        <span>{statusLabel}</span>
        {user ? (
          <button className="ghost-button" onClick={handleLogout} type="button">
            {uiCopy.auth.logout}
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
          <p>{uiCopy.auth.summary(user.username)}</p>
        </div>
      ) : (
        <div className="auth-grid">
          <form className="item-form" onSubmit={handleLogin} noValidate>
            <h3>{uiCopy.auth.login.title}</h3>
            <label>
              <span>{uiCopy.auth.login.username}</span>
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
              <span>{uiCopy.auth.login.password}</span>
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
              {authenticating
                ? uiCopy.auth.login.submitting
                : uiCopy.auth.login.submit}
            </button>
          </form>

          <form className="item-form" onSubmit={handleRegister} noValidate>
            <h3>{uiCopy.auth.register.title}</h3>
            <label>
              <span>{uiCopy.auth.register.displayName}</span>
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
              <span>{uiCopy.auth.register.username}</span>
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
              <span>{uiCopy.auth.register.password}</span>
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
            <button className="ghost-button" disabled={registering} type="submit">
              {registering
                ? uiCopy.auth.register.submitting
                : uiCopy.auth.register.submit}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
