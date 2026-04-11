import { AuthSection } from "./components/AuthSection";
import { HeroSection } from "./components/HeroSection";
import { ItemSection } from "./components/ItemSection";
import { useAuthController } from "./hooks/useAuthController";
import "./styles.css";

export default function App() {
  const auth = useAuthController();

  return (
    <main className="app-shell">
      <HeroSection />
      <AuthSection auth={auth} />
      <ItemSection user={auth.session.user} />
    </main>
  );
}
