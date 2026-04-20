import type { components } from "../generated/schema";
import { uiCopy } from "../lib/ui-copy";

type HealthResponse = components["schemas"]["HealthResponse"];

type ItemStatusPanelProps = {
  health: HealthResponse | null;
  loading: boolean;
  pageError: string | null;
};

export function ItemStatusPanel({
  health,
  loading,
  pageError,
}: ItemStatusPanelProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{uiCopy.items.status.heading}</h2>
      </header>
      {loading ? <p>{uiCopy.items.status.loading}</p> : null}
      {pageError ? (
        <p className="error" role="alert">
          {pageError}
        </p>
      ) : null}
      {!loading && !pageError && health ? (
        <dl className="status-grid" aria-label="API status">
          <div>
            <dt>{uiCopy.items.status.labels.status}</dt>
            <dd>{health.status}</dd>
          </div>
          <div>
            <dt>{uiCopy.items.status.labels.service}</dt>
            <dd>{health.service}</dd>
          </div>
          <div>
            <dt>{uiCopy.items.status.labels.version}</dt>
            <dd>{health.version}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
