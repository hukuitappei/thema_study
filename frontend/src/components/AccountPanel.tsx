import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { components } from "../generated/schema";

type PasswordChangeRequest = components["schemas"]["PasswordChangeRequest"];
type UserProfile = components["schemas"]["UserProfile"];
type UserProfileUpdate = components["schemas"]["UserProfileUpdate"];

type AccountPanelProps = {
  handlePasswordSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleProfileSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  passwordBusy: boolean;
  passwordError: string | null;
  passwordForm: PasswordChangeRequest;
  profileBusy: boolean;
  profileError: string | null;
  profileForm: UserProfileUpdate;
  setPasswordForm: Dispatch<SetStateAction<PasswordChangeRequest>>;
  setProfileForm: Dispatch<SetStateAction<UserProfileUpdate>>;
  user: UserProfile | null;
};

export function AccountPanel({
  handlePasswordSubmit,
  handleProfileSubmit,
  passwordBusy,
  passwordError,
  passwordForm,
  profileBusy,
  profileError,
  profileForm,
  setPasswordForm,
  setProfileForm,
  user,
}: AccountPanelProps) {
  if (!user) {
    return null;
  }

  return (
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
  );
}
