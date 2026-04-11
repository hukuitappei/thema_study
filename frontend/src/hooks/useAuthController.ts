import { useAccountSettings } from "./useAccountSettings";
import { useAuthForms } from "./useAuthForms";
import { useAuthSession } from "./useAuthSession";

export function useAuthController() {
  const session = useAuthSession();
  const forms = useAuthForms({
    authenticate: session.authenticate,
    setAuthNotice: session.setAuthNotice,
  });
  const account = useAccountSettings({
    clearSession: session.clearSession,
    setAuthNotice: session.setAuthNotice,
    setUser: session.authenticate,
    user: session.user,
  });

  return {
    authMode: session.authMode,
    authNotice: session.authNotice,
    authenticating: forms.authenticating,
    handleLogin: forms.handleLogin,
    handleLogout: account.handleLogout,
    handlePasswordSubmit: account.handlePasswordSubmit,
    handleProfileSubmit: account.handleProfileSubmit,
    handleRegister: forms.handleRegister,
    loginError: forms.loginError,
    loginForm: forms.loginForm,
    passwordBusy: account.passwordBusy,
    passwordError: account.passwordError,
    passwordForm: account.passwordForm,
    profileBusy: account.profileBusy,
    profileError: account.profileError,
    profileForm: account.profileForm,
    registerError: forms.registerError,
    registerForm: forms.registerForm,
    registering: forms.registering,
    setLoginForm: forms.setLoginForm,
    setPasswordForm: account.setPasswordForm,
    setProfileForm: account.setProfileForm,
    setRegisterForm: forms.setRegisterForm,
    user: session.user,
  };
}
