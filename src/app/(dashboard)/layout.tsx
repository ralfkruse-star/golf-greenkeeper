export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={styles.layout}>
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <a href="/" style={styles.logo}>
            🏌️ Golf Greenkeeper
          </a>
          <div style={styles.navLinks}>
            <a href="/dashboard" style={styles.navLink}>
              Dashboard
            </a>
            <a href="/dashboard/tasks" style={styles.navLink}>
              Aufgaben
            </a>
            <a href="/" style={styles.navLink}>
              API Docs
            </a>
          </div>
        </div>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  )
}

const styles = {
  layout: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  nav: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 0',
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: '#1f2937',
  },
  navLinks: {
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    textDecoration: 'none',
    color: '#6b7280',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  main: {
    minHeight: 'calc(100vh - 73px)',
  },
}
