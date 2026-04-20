import { uiCopy } from "../lib/ui-copy";

export function HeroSection() {
  return (
    <section className="hero">
      <p className="eyebrow">{uiCopy.hero.eyebrow}</p>
      <h1>{uiCopy.hero.title}</h1>
      <p className="lead">{uiCopy.hero.lead}</p>
    </section>
  );
}
