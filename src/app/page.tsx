export default function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🏌️ Golf Greenkeeper</h1>
      <p>Digitales Platzpflege- und Maintenance-Management-System</p>

      <h2>API Endpoints</h2>
      <ul>
        <li><strong>Auth:</strong> POST /api/auth/login, POST /api/auth/register, POST /api/auth/refresh</li>
        <li><strong>Tasks:</strong> GET/POST /api/tasks, PATCH /api/tasks/:id/status</li>
        <li><strong>Locations:</strong> GET/POST /api/locations</li>
        <li><strong>Equipment:</strong> GET/POST /api/equipment, POST /api/equipment/:id/usage/start</li>
        <li><strong>QR Codes:</strong> GET /api/qr/equipment/:code, GET /api/qr/location/:code, GET /api/qr/task/:code</li>
      </ul>

      <h2>Features</h2>
      <ul>
        <li>✅ Task Management mit State Machine</li>
        <li>✅ Location/Zone Management</li>
        <li>✅ Equipment Tracking & Wartung</li>
        <li>✅ JWT Authentication & Authorization</li>
        <li>✅ QR-Code Integration</li>
        <li>✅ Test-Driven Development</li>
      </ul>

      <p>
        <small>Siehe <a href="/README.md">README.md</a> und <a href="/ARCHITECTURE.md">ARCHITECTURE.md</a> für mehr Details.</small>
      </p>
    </div>
  )
}
