import { useState, type FormEvent } from "react";
import type { components } from "../generated/schema";
import { apiClient } from "../lib/api";
import { uiCopy } from "../lib/ui-copy";
import { persistAccessToken } from "./useAuthSession";

type LoginRequest = components["schemas"]["LoginRequest"];
type RegisterRequest = components["schemas"]["RegisterRequest"];
type UserProfile = components["schemas"]["UserProfile"];

const usernamePattern = /^[a-zA-Z0-9_]+$/;

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
      return uiCopy.auth.validation.loginUsernameRequired;
    }
    if (!loginForm.password) {
      return uiCopy.auth.validation.loginPasswordRequired;
    }
    return null;
  }

  function validateRegisterForm() {
    const username = registerForm.username.trim();
    const displayName = registerForm.display_name.trim();
    const password = registerForm.password;

    if (!displayName) {
      return uiCopy.auth.validation.displayNameRequired;
    }
    if (displayName.length > 64) {
      return uiCopy.auth.validation.displayNameTooLong;
    }
    if (!username) {
      return uiCopy.auth.validation.usernameRequired;
    }
    if (username.length < 3) {
      return uiCopy.auth.validation.usernameTooShort;
    }
    if (username.length > 32) {
      return uiCopy.auth.validation.usernameTooLong;
    }
    if (!usernamePattern.test(username)) {
      return uiCopy.auth.validation.usernamePattern;
    }
    if (!password) {
      return uiCopy.auth.validation.passwordRequired;
    }
    if (password.length < 8) {
      return uiCopy.auth.validation.passwordTooShort;
    }
    if (password.length > 128) {
      return uiCopy.auth.validation.passwordTooLong;
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
      setAuthNotice(uiCopy.auth.notices.loggedIn(response.user.display_name));
    } catch (cause) {
      persistAccessToken(null);
      const message =
        cause instanceof Error ? cause.message : uiCopy.auth.validation.loginFailed;
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
      setAuthNotice(uiCopy.auth.notices.registered(created.display_name));
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : uiCopy.auth.validation.registerFailed;
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
