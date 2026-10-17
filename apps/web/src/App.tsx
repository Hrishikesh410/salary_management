import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Database, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  Server, 
  Globe, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

interface HealthResponse {
  status: string;
  service: string;
  uptime: number;
  timestamp: string;
}

export const App: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      const response = await fetch('/api/health');
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: HealthResponse = await response.json();
      setHealthData(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reach API health endpoint';
      setError(message);
      setHealthData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <div className="app-container">
      {/* Header Banner */}
      <header>
        <div className="header-badge" id="foundation-badge">
          <ShieldCheck size={14} />
          <span>Foundation Setup &middot; Phase 1 Complete</span>
        </div>
        <h1 className="header-title" id="main-heading">
          Incubyte Global Salary Management
        </h1>
        <p className="header-subtitle">
          High-performance compensation directory & currency-isolated analytics for 10,000 international employees across global entities.
        </p>
      </header>

      {/* Grid of Cards */}
      <main className="dashboard-grid">
        {/* Card 1: API Health Monitor */}
        <section className="glass-panel card-body" aria-labelledby="health-card-title">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrapper cyan">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="card-title" id="health-card-title">Backend API Health</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  GET /api/health
                </span>
              </div>
            </div>

            <div id="health-status-badge">
              {isLoading ? (
                <span className="status-pill pending">
                  <span className="pulse-dot" /> Checking
                </span>
              ) : error ? (
                <span className="status-pill error">
                  <AlertCircle size={12} /> Offline
                </span>
              ) : healthData ? (
                <span className="status-pill success">
                  <span className="pulse-dot" /> Operational
                </span>
              ) : null}
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Monitors real-time connectivity between the React client and Express API gateway.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Latency</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: latency && latency < 200 ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                {latency !== null ? `${latency} ms` : '—'}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>API Status</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: healthData ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {healthData ? healthData.status.toUpperCase() : error ? 'UNREACHABLE' : 'PENDING'}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Response Payload
            </div>
            <pre className="code-block" id="health-json-output">
              {isLoading 
                ? '// Probing /api/health ...' 
                : error 
                ? `// Connection Error:\n${error}\n// Ensure Express API is running on :4000` 
                : JSON.stringify(healthData, null, 2)}
            </pre>
          </div>

          <button
            id="health-check-btn"
            className="btn-primary"
            onClick={checkHealth}
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Checking Endpoint...' : 'Re-verify Health Endpoint'}
          </button>
        </section>

        {/* Card 2: Monorepo Architecture */}
        <section className="glass-panel card-body" aria-labelledby="arch-card-title">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrapper">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="card-title" id="arch-card-title">Architecture Foundation</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Monorepo Boundaries
                </span>
              </div>
            </div>
            <span className="badge-tag ready">VERIFIED</span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Isolated workspace packages configured with strict TypeScript and unified root scripts.
          </p>

          <ul className="checklist">
            <li className="checklist-item">
              <Globe size={18} color="var(--accent-cyan)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div className="checklist-item-title">apps/web (Frontend)</div>
                <div className="checklist-item-desc">
                  React 18 + Vite + TypeScript. Optimized for sub-second UI transitions and zero jank.
                </div>
              </div>
            </li>

            <li className="checklist-item">
              <Server size={18} color="var(--accent-indigo)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div className="checklist-item-title">apps/api (Backend Gateway)</div>
                <div className="checklist-item-desc">
                  Node.js + Express + TypeScript. Equipped with health endpoint, CORS, and graceful termination.
                </div>
              </div>
            </li>

            <li className="checklist-item">
              <Database size={18} color="var(--accent-emerald)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div className="checklist-item-title">Database & ORM</div>
                <div className="checklist-item-desc">
                  PostgreSQL datasource with Prisma ORM. Models configured with DECIMAL(12,2) monetary precision.
                </div>
              </div>
            </li>
          </ul>
        </section>

        {/* Card 3: P0 Roadmap Readiness */}
        <section className="glass-panel card-body" style={{ gridColumn: '1 / -1' }} aria-labelledby="roadmap-card-title">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-wrapper emerald">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h2 className="card-title" id="roadmap-card-title">PRD P0 Implementation Roadmap</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Target scale: 10,000 Employees across international teams
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="checklist-item" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span className="checklist-item-title">FR-1: Data Exploration</span>
                <span className="badge-tag next">P0 Ready</span>
              </div>
              <p className="checklist-item-desc">
                Debounced search, multi-field filtering (Country, Dept, Currency), indexed server-side sorting & pagination.
              </p>
            </div>

            <div className="checklist-item" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span className="checklist-item-title">FR-2: Salary Inspection & Update</span>
                <span className="badge-tag next">P0 Ready</span>
              </div>
              <p className="checklist-item-desc">
                Modal/inline editing with Decimal(12,2) precision, immutable currency codes, and zero floating-point drift.
              </p>
            </div>

            <div className="checklist-item" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span className="checklist-item-title">FR-3: Multi-Currency Summaries</span>
                <span className="badge-tag next">P0 Ready</span>
              </div>
              <p className="checklist-item-desc">
                Database-level GROUP BY aggregations strictly isolated by (Country, Currency) and (Department, Currency).
              </p>
            </div>

            <div className="checklist-item" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span className="checklist-item-title">FR-4: 10k Seeding Script</span>
                <span className="badge-tag next">P0 Ready</span>
              </div>
              <p className="checklist-item-desc">
                Deterministic Prisma seed populating 10,000 international employee records across ≥5 countries for benchmarking.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer-text">
        Incubyte Salary Management &middot; Built with React, Vite, Express, Prisma & PostgreSQL &middot;
        Refer to <a href="/docs/architecture.md" target="_blank" rel="noreferrer">docs/architecture.md</a> for complete architectural details.
      </footer>
    </div>
  );
};

export default App;
