import { useEffect, useState, type FormEvent } from "react";
import type { components } from "../generated/schema";
import { apiClient } from "../lib/api";

type PasswordChangeRequest = components["schemas"]["PasswordChangeRequest"];
type UserProfile = components["schemas"]["UserProfile"];
type UserProfileUpdate = components["schemas"]["UserProfileUpdate"];

type UseAccountSettingsParams = {
  clearSession: (notice: string) => void;
  setAuthNotice: (notice: string | null) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
};

export function useAccountSettings({
  clearSession,
  setAuthNotice,
  user,
  setUser,
}: UseAccountSettingsParams) {
  const [profileForm, setProfileForm] = useState<UserProfileUpdate>({
    display_name: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordChangeRequest>({
    current_password: "",
    new_password: "",
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  useEffect(() => {
    setProfileForm({ display_name: user?.display_name ?? "" });
    if (!user) {
      setPasswordForm({ current_password: "", new_password: "" });
    }
  }, [user]);

  function handleLogout() {
    setPasswordForm({ current_password: "", new_password: "" });
    clearSession("ログアウトしました。");
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
      setPasswordForm({ current_password: "", new_password: "" });
      clearSession("パスワードを変更しました。再度ログインしてください。");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "パスワード変更に失敗しました。";
      setPasswordError(message);
    } finally {
      setPasswordBusy(false);
    }
  }

  return {
    handleLogout,
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
  };
}
