import { AccountPanel } from "./components/AccountPanel";
import { AuthPanel } from "./components/AuthPanel";
import { ItemEditorPanel } from "./components/ItemEditorPanel";
import { ItemListPanel } from "./components/ItemListPanel";
import { useAuthController } from "./hooks/useAuthController";
import { useItemsController } from "./hooks/useItemsController";
import "./styles.css";

export default function App() {
  const auth = useAuthController();
  const itemState = useItemsController(auth.user?.username ?? null);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">TypeScript + Python foundation</p>
        <h1>FastAPI と React の型安全な疎通を先に成立させる</h1>
        <p className="lead">
          バックエンドの OpenAPI を正として、フロントエンドは生成型を使って通信します。
        </p>
      </section>

      <section className="panel">
        <header className="panel-header">
          <h2>API 状態</h2>
        </header>
        {itemState.loading ? <p>読み込み中...</p> : null}
        {itemState.pageError ? (
          <p className="error" role="alert">
            {itemState.pageError}
          </p>
        ) : null}
        {!itemState.loading && !itemState.pageError && itemState.health ? (
          <dl className="status-grid" aria-label="API status">
            <div>
              <dt>Status</dt>
              <dd>{itemState.health.status}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{itemState.health.service}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{itemState.health.version}</dd>
            </div>
          </dl>
        ) : null}
      </section>

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

      <ItemEditorPanel
        editingId={itemState.editingId}
        form={itemState.form}
        handleSubmit={itemState.handleSubmit}
        itemError={itemState.itemError}
        itemNotice={itemState.itemNotice}
        resetForm={itemState.resetForm}
        setForm={itemState.setForm}
        setTagInput={itemState.setTagInput}
        submitting={itemState.submitting}
        tagInput={itemState.tagInput}
        user={auth.user}
      />

      <ItemListPanel
        currentPage={itemState.currentPage}
        handleDelete={itemState.handleDelete}
        handleEdit={itemState.handleEdit}
        handleOwnershipFilterChange={itemState.handleOwnershipFilterChange}
        handleSearchQueryChange={itemState.handleSearchQueryChange}
        handleSelectTag={itemState.handleSelectTag}
        handleSortKeyChange={itemState.handleSortKeyChange}
        itemSortOptions={itemState.itemSortOptions}
        itemsPerPage={itemState.itemsPerPage}
        onNextPage={itemState.onNextPage}
        onPreviousPage={itemState.onPreviousPage}
        ownershipFilter={itemState.ownershipFilter}
        ownershipFilterOptions={itemState.ownershipFilterOptions}
        paginatedItems={itemState.paginatedItems}
        searchQuery={itemState.searchQuery}
        selectedTag={itemState.selectedTag}
        sortKey={itemState.sortKey}
        tags={itemState.tags}
        totalPages={itemState.totalPages}
        user={auth.user}
        visibleItems={itemState.visibleItems}
      />
    </main>
  );
}
