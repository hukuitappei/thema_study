import { useState, type FormEvent } from "react";
import type { components } from "../generated/schema";
import { apiClient } from "../lib/api";
import { persistAccessToken } from "./useAuthSession";

type LoginRequest = components["schemas"]["LoginRequest"];
type RegisterRequest = components["schemas"]["RegisterRequest"];
type UserProfile = components["schemas"]["UserProfile"];

const usernamePattern = /^[a-zA-Z0-9_]+$/;

function getValidationMessage(field: string, message: string) {
  return `${field}: ${message}`;
}

type UseAuthFormsParams = {
  authenticate: (user: UserProfile, token?: string) => void;
  setAuthNotice: (notice: string | null) => void;
};

export function useAuthForms({
  authenticate,
  setAuthNotice,
}: UseAuthFormsParams) {
  const [authenticating, setAuthenticating] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    username: "admin",
    password: "password123",
  });
  const [registerForm, setRegisterForm] = useState<RegisterRequest>({
    username: "",
    display_name: "",
    password: "",
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

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

      authenticate(response.user, response.access_token);
      setAuthNotice(`ログインしました: ${response.user.display_name}`);
    } catch (cause) {
      persistAccessToken(null);
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

  return {
    authenticating,
    handleLogin,
    handleRegister,
    loginError,
    loginForm,
    registerError,
    registerForm,
    registering,
    setLoginForm,
    setRegisterForm,
  };
}
