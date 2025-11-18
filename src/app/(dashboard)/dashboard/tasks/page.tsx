'use client'

import { useEffect, useState } from 'react'

interface Task {
  id: string
  code: string
  title: string
  status: string
  priority: string
  assignedToId?: string
  scheduledStart?: string
  scheduledEnd?: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadTasks()
  }, [filter])

  const loadTasks = () => {
    const url = filter === 'all' ? '/api/tasks' : `/api/tasks?status=${filter}`

    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setTasks(result.data.tasks || [])
        }
      })
      .catch((error) => console.error('Failed to load tasks:', error))
      .finally(() => setLoading(false))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10b981'
      case 'IN_PROGRESS':
        return '#3b82f6'
      case 'TODO':
        return '#6b7280'
      case 'ON_HOLD':
        return '#f59e0b'
      case 'CANCELLED':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '🔴'
      case 'HIGH':
        return '🟠'
      case 'MEDIUM':
        return '🟡'
      case 'LOW':
        return '🟢'
      default:
        return '⚪'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📋 Aufgaben</h1>
        <button style={styles.newButton} onClick={() => alert('Neue Aufgabe (API: POST /api/tasks)')}>
          + Neue Aufgabe
        </button>
      </div>

      <div style={styles.filters}>
        <button
          style={filter === 'all' ? styles.filterActive : styles.filter}
          onClick={() => setFilter('all')}
        >
          Alle
        </button>
        <button
          style={filter === 'TODO' ? styles.filterActive : styles.filter}
          onClick={() => setFilter('TODO')}
        >
          Offen
        </button>
        <button
          style={filter === 'IN_PROGRESS' ? styles.filterActive : styles.filter}
          onClick={() => setFilter('IN_PROGRESS')}
        >
          In Arbeit
        </button>
        <button
          style={filter === 'COMPLETED' ? styles.filterActive : styles.filter}
          onClick={() => setFilter('COMPLETED')}
        >
          Erledigt
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Lade Aufgaben...</div>
      ) : tasks.length === 0 ? (
        <div style={styles.empty}>Keine Aufgaben gefunden</div>
      ) : (
        <div style={styles.taskList}>
          {tasks.map((task) => (
            <div key={task.id} style={styles.taskCard}>
              <div style={styles.taskHeader}>
                <div>
                  <span style={styles.taskCode}>{task.code}</span>
                  <span style={{ marginLeft: '0.5rem' }}>{getPriorityEmoji(task.priority)}</span>
                </div>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(task.status),
                  }}
                >
                  {task.status}
                </span>
              </div>
              <h3 style={styles.taskTitle}>{task.title}</h3>
              {task.scheduledStart && (
                <div style={styles.taskMeta}>
                  📅 {new Date(task.scheduledStart).toLocaleDateString('de-DE')}
                </div>
              )}
              <div style={styles.taskActions}>
                <button
                  style={styles.actionButton}
                  onClick={() => alert(`API: GET /api/tasks/${task.id}`)}
                >
                  Details
                </button>
                {task.status === 'TODO' && (
                  <button
                    style={styles.actionButtonPrimary}
                    onClick={() => alert(`API: PATCH /api/tasks/${task.id}/status`)}
                  >
                    Starten
                  </button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <button
                    style={styles.actionButtonSuccess}
                    onClick={() => alert(`API: PATCH /api/tasks/${task.id}/status`)}
                  >
                    Abschließen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  newButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  filters: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
  },
  filter: {
    padding: '0.5rem 1rem',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  filterActive: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: '1px solid #3b82f6',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  taskList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  taskCode: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#fff',
  },
  taskTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#1f2937',
  },
  taskMeta: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },
  taskActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  actionButtonPrimary: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  actionButtonSuccess: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#6b7280',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#6b7280',
  },
}
