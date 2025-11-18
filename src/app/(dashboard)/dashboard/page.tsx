'use client'

import { useEffect, useState } from 'react'

interface DashboardData {
  tasks: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    overdueTask: number
    completionRate: number
  }
  equipment: {
    totalEquipment: number
    activeEquipment: number
    maintenanceDue: number
  }
  materials: {
    lowStockItems: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports/dashboard', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result.data)
        }
      })
      .catch((error) => console.error('Failed to load dashboard:', error))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Lade Dashboard...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Dashboard-Daten konnten nicht geladen werden</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏌️ Golf Greenkeeper Dashboard</h1>

      <div style={styles.grid}>
        {/* Tasks Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📋 Aufgaben</h2>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <div style={styles.statValue}>{data.tasks.totalTasks}</div>
              <div style={styles.statLabel}>Gesamt</div>
            </div>
            <div style={styles.stat}>
              <div style={{ ...styles.statValue, color: '#10b981' }}>
                {data.tasks.completedTasks}
              </div>
              <div style={styles.statLabel}>Erledigt</div>
            </div>
            <div style={styles.stat}>
              <div style={{ ...styles.statValue, color: '#3b82f6' }}>
                {data.tasks.inProgressTasks}
              </div>
              <div style={styles.statLabel}>In Arbeit</div>
            </div>
            <div style={styles.stat}>
              <div style={{ ...styles.statValue, color: '#ef4444' }}>
                {data.tasks.overdueTask}
              </div>
              <div style={styles.statLabel}>Überfällig</div>
            </div>
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${data.tasks.completionRate}%`,
              }}
            />
          </div>
          <div style={styles.small}>
            Abschlussrate: {Math.round(data.tasks.completionRate)}%
          </div>
        </div>

        {/* Equipment Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🚜 Equipment</h2>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <div style={styles.statValue}>{data.equipment.totalEquipment}</div>
              <div style={styles.statLabel}>Gesamt</div>
            </div>
            <div style={styles.stat}>
              <div style={{ ...styles.statValue, color: '#10b981' }}>
                {data.equipment.activeEquipment}
              </div>
              <div style={styles.statLabel}>Aktiv</div>
            </div>
            <div style={styles.stat}>
              <div style={{ ...styles.statValue, color: '#f59e0b' }}>
                {data.equipment.maintenanceDue}
              </div>
              <div style={styles.statLabel}>Wartung fällig</div>
            </div>
          </div>
        </div>

        {/* Materials Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🧪 Materialien</h2>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <div style={{ ...styles.statValue, color: '#ef4444' }}>
                {data.materials.lowStockItems}
              </div>
              <div style={styles.statLabel}>Niedriger Bestand</div>
            </div>
          </div>
          {data.materials.lowStockItems > 0 && (
            <div style={styles.alert}>
              ⚠️ {data.materials.lowStockItems} Material(ien) benötigen Nachschub
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>⚡ Schnellzugriff</h2>
          <div style={styles.actions}>
            <a href="/dashboard/tasks" style={styles.button}>
              Aufgaben anzeigen
            </a>
            <a href="/dashboard/equipment" style={styles.button}>
              Equipment verwalten
            </a>
            <a href="/dashboard/materials" style={styles.button}>
              Materialien prüfen
            </a>
            <a href="/api/reports/dashboard" style={styles.buttonSecondary}>
              Vollständiger Report (API)
            </a>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <p>
          <strong>API Endpunkte:</strong>
        </p>
        <ul style={styles.apiList}>
          <li>GET /api/reports/dashboard - Dashboard Summary</li>
          <li>GET /api/tasks - Aufgabenliste</li>
          <li>GET /api/equipment - Equipment-Liste</li>
          <li>GET /api/materials/low-stock - Niedriger Bestand</li>
          <li>GET /api/sensors/alerts - Sensor-Alarme</li>
          <li>WS /ws?token=YOUR_TOKEN - Real-time Updates</li>
        </ul>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    color: '#1f2937',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#374151',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '1rem',
  },
  stat: {
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    transition: 'width 0.3s ease',
  },
  small: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'center' as const,
  },
  alert: {
    padding: '0.75rem',
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#92400e',
    marginTop: '1rem',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  button: {
    padding: '0.75rem 1rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderRadius: '6px',
    textAlign: 'center' as const,
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  buttonSecondary: {
    padding: '0.75rem 1rem',
    backgroundColor: '#6b7280',
    color: '#fff',
    borderRadius: '6px',
    textAlign: 'center' as const,
    textDecoration: 'none',
    fontWeight: '500',
  },
  footer: {
    marginTop: '3rem',
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
  },
  apiList: {
    listStyle: 'none',
    padding: 0,
    margin: '0.5rem 0 0 0',
    fontSize: '0.875rem',
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    fontSize: '1.125rem',
    color: '#6b7280',
  },
  error: {
    textAlign: 'center' as const,
    padding: '3rem',
    fontSize: '1.125rem',
    color: '#ef4444',
  },
}
