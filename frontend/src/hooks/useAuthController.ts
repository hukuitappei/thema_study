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
    session: {
      authMode: session.authMode,
      authNotice: session.authNotice,
      handleLogout: account.handleLogout,
      user: session.user,
    },
    forms: {
      authenticating: forms.authenticating,
      handleLogin: forms.handleLogin,
      handleRegister: forms.handleRegister,
      loginError: forms.loginError,
      loginForm: forms.loginForm,
      registerError: forms.registerError,
      registerForm: forms.registerForm,
      registering: forms.registering,
      setLoginForm: forms.setLoginForm,
      setRegisterForm: forms.setRegisterForm,
    },
    account: {
      handlePasswordSubmit: account.handlePasswordSubmit,
      handleProfileSubmit: account.handleProfileSubmit,
      passwordBusy: account.passwordBusy,
      passwordError: account.passwordError,
      passwordForm: account.passwordForm,
      profileBusy: account.profileBusy,
      profileError: account.profileError,
      profileForm: account.profileForm,
      setPasswordForm: account.setPasswordForm,
      setProfileForm: account.setProfileForm,
    },
  };
}
