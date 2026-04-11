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
        authMode={auth.authMode}
        authNotice={auth.authNotice}
        authenticating={auth.authenticating}
        handleLogin={auth.handleLogin}
        handleLogout={auth.handleLogout}
        handleRegister={auth.handleRegister}
        loginError={auth.loginError}
        loginForm={auth.loginForm}
        registering={auth.registering}
        registerError={auth.registerError}
        registerForm={auth.registerForm}
        setLoginForm={auth.setLoginForm}
        setRegisterForm={auth.setRegisterForm}
        user={auth.user}
      />

      <AccountPanel
        handlePasswordSubmit={auth.handlePasswordSubmit}
        handleProfileSubmit={auth.handleProfileSubmit}
        passwordBusy={auth.passwordBusy}
        passwordError={auth.passwordError}
        passwordForm={auth.passwordForm}
        profileBusy={auth.profileBusy}
        profileError={auth.profileError}
        profileForm={auth.profileForm}
        setPasswordForm={auth.setPasswordForm}
        setProfileForm={auth.setProfileForm}
        user={auth.user}
      />
    </>
  );
}
