import { useEffect, useState, type FormEvent } from "react";
import type { components } from "../generated/schema";
import { apiClient } from "../lib/api";
import { uiCopy } from "../lib/ui-copy";

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
    clearSession(uiCopy.auth.notices.loggedOut);
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profileForm.display_name.trim()) {
      setProfileError(uiCopy.account.validation.displayNameRequired);
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
      setAuthNotice(uiCopy.account.notices.profileUpdated(updated.display_name));
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : uiCopy.account.validation.profileFailed;
      setProfileError(message);
    } finally {
      setProfileBusy(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordForm.current_password || !passwordForm.new_password) {
      setPasswordError(uiCopy.account.validation.passwordRequired);
      return;
    }

    try {
      setPasswordBusy(true);
      setPasswordError(null);
      await apiClient.changePassword(passwordForm);
      setPasswordForm({ current_password: "", new_password: "" });
      clearSession(uiCopy.account.notices.passwordChanged);
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : uiCopy.account.validation.passwordFailed;
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
