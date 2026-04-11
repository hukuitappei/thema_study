import { AccountPanel } from "./AccountPanel";
import { AuthPanel } from "./AuthPanel";
import { useAuthController } from "../hooks/useAuthController";

type AuthSectionProps = {
  auth: ReturnType<typeof useAuthController>;
};

export function AuthSection({ auth }: AuthSectionProps) {
  return (
    <>
      <AuthPanel
        authMode={auth.session.authMode}
        authNotice={auth.session.authNotice}
        authenticating={auth.forms.authenticating}
        handleLogin={auth.forms.handleLogin}
        handleLogout={auth.session.handleLogout}
        handleRegister={auth.forms.handleRegister}
        loginError={auth.forms.loginError}
        loginForm={auth.forms.loginForm}
        registering={auth.forms.registering}
        registerError={auth.forms.registerError}
        registerForm={auth.forms.registerForm}
        setLoginForm={auth.forms.setLoginForm}
        setRegisterForm={auth.forms.setRegisterForm}
        user={auth.session.user}
      />

      <AccountPanel
        handlePasswordSubmit={auth.account.handlePasswordSubmit}
        handleProfileSubmit={auth.account.handleProfileSubmit}
        passwordBusy={auth.account.passwordBusy}
        passwordError={auth.account.passwordError}
        passwordForm={auth.account.passwordForm}
        profileBusy={auth.account.profileBusy}
        profileError={auth.account.profileError}
        profileForm={auth.account.profileForm}
        setPasswordForm={auth.account.setPasswordForm}
        setProfileForm={auth.account.setProfileForm}
        user={auth.session.user}
      />
    </>
  );
}
