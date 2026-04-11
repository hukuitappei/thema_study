import { AuthSection } from "./components/AuthSection";
import { ItemSection } from "./components/ItemSection";
import { useAuthController } from "./hooks/useAuthController";
import "./styles.css";

export default function App() {
  const auth = useAuthController();

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">TypeScript + Python foundation</p>
        <h1>FastAPI と React の型安全な疎通を先に成立させる</h1>
        <p className="lead">
          バックエンドの OpenAPI を正として、フロントエンドは生成型を使って通信します。
        </p>
      </section>

      <AuthSection auth={auth} />
      <ItemSection
        currentUsername={auth.user?.username ?? null}
        user={auth.user}
      />
    </main>
  );
}
