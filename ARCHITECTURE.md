# Golf Greenkeeper - System Architecture

## Overview
Digital Platzpflege & Maintenance Management System für mittelgroße Golfclubs.

## Tech Stack
- **Backend & Frontend**: Next.js 14 (App Router), TypeScript
- **Database**: PostgreSQL mit Prisma ORM
- **Cache**: Redis (Sessions, Caching, Live-Daten)
- **Time-Series**: PostgreSQL (später optional TimescaleDB/InfluxDB)
- **Mobile**: React Web-App (später optional React Native)
- **Testing**: Vitest + Testing Library (TDD-Approach)
- **Auth**: JWT (Access + Refresh Tokens), Argon2 für Passwörter
- **Realtime**: WebSockets (Next.js Route Handler)
- **CI/CD**: GitHub Actions

## Bounded Contexts & Module

### 1. core/locations
**Zweck**: Verwaltung der Golfplatz-Topologie
- **Entitäten**: Course, Hole, Zone
- **Typen**: GREEN, FAIRWAY, TEE, BUNKER, ROUGH, PRACTICE_AREA
- **Funktionen**:
  - Hierarchische Struktur (Course → Holes → Zones)
  - Geo-Koordinaten (optional)
  - Größenangaben, Pflegeintervalle
  - QR-Code-Referenzen

### 2. core/tasks
**Zweck**: Arbeitsaufträge und deren Lifecycle
- **Entitäten**: Task, WorkOrder, TaskLog
- **Status-Flow**: TODO → ASSIGNED → IN_PROGRESS → COMPLETED / CANCELLED
- **Funktionen**:
  - Prioritäten (LOW, MEDIUM, HIGH, URGENT)
  - Geplante vs. tatsächliche Zeiten
  - Zuordnung zu Zones, Equipment
  - Checklisten, Foto-Uploads
  - Automatisches Logging aller Statuswechsel

### 3. core/equipment
**Zweck**: Maschinen- und Fahrzeugverwaltung
- **Entitäten**: Equipment, EquipmentUsageLog, MaintenancePlan, MaintenanceEvent
- **Funktionen**:
  - Betriebsstunden-Tracking
  - Check-in/Check-out via QR
  - Wartungsintervalle (Stunden-/Datumsbasiert)
  - Kostenerfassung

### 4. core/materials
**Zweck**: Verbrauchsmaterialien (Dünger, Chemikalien, Sand)
- **Entitäten**: Material, MaterialApplication, Inventory
- **Funktionen**:
  - Lagerbestandsführung
  - Anwendungs-Logs (wer, wann, wo, wieviel)
  - Compliance-Tracking (z.B. Fungizid-Limits)

### 5. core/weather
**Zweck**: Wetter- und Klimadaten
- **Entitäten**: WeatherSnapshot, Forecast
- **Funktionen**:
  - Tägliche Snapshots (Temperatur, Niederschlag, ET)
  - Externe API-Integration (z.B. OpenWeatherMap)
  - Historische Daten für Analysen

### 6. core/sensors
**Zweck**: IoT-Integration (Bodenfeuchte, etc.)
- **Entitäten**: SensorDevice, SensorReading
- **Funktionen**:
  - Device-Registry
  - Time-Series-Readings (zunächst PostgreSQL)
  - Alert-Schwellenwerte (zukünftig)

### 7. core/reports
**Zweck**: KPIs, Dashboards, Export
- **Entitäten**: ReportDefinition, GeneratedReport
- **Funktionen**:
  - Arbeitszeit-Analysen
  - Equipment-Kosten
  - Material-Verbrauch
  - Wasser-/Chemikalien-Tracking
  - PDF/CSV-Export

### 8. auth/users
**Zweck**: Authentifizierung und Autorisierung
- **Entitäten**: User, Role, Permission
- **Rollen**:
  - `GREENKEEPER`: Basis-Mitarbeiter
  - `HEAD_GREENKEEPER`: Team-Lead
  - `MANAGER`: Management-Ebene
  - `ADMIN`: System-Admin
- **Funktionen**:
  - JWT-basierte Auth
  - Refresh-Token-Rotation
  - Role-Based Access Control (RBAC)

## Logical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌──────────────┬───────────────┬───────────────────────┐   │
│  │  /app/...    │  /app/api/... │  /app/_components/... │   │
│  │  (UI Pages)  │  (API Routes) │  (Shared UI)          │   │
│  └──────────────┴───────────────┴───────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│  │ taskSvc  │ equipSvc │ locSvc   │ authSvc  │ ...      │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘   │
│  - Business Logic                                            │
│  - Validation                                                │
│  - Domain Events (optional)                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Persistence Layer (Prisma)                  │
│  - PostgreSQL                                                │
│  - Transactions                                              │
│  - Migrations                                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│             Infrastructure                                   │
│  ┌──────────────┬──────────────┬───────────────────────┐    │
│  │  PostgreSQL  │    Redis     │   External APIs       │    │
│  │              │              │   (Weather, IoT)      │    │
│  └──────────────┴──────────────┴───────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Layered Separation

### 1. API Layer (`/app/api/*`)
- HTTP Request/Response Handling
- Input Validation (Zod Schemas)
- Auth Middleware
- Error Transformation
- **Regel**: Keine Business-Logik in Route Handlers

### 2. Service Layer (`/src/modules/*/services`)
- Domain Logic
- Cross-Entity Operations
- Transaction Management
- Event Emission
- **Regel**: Services nutzen Prisma direkt

### 3. Persistence Layer (Prisma)
- Database Queries
- Schema Definitions
- Migrations
- **Regel**: Kein direkter DB-Zugriff außerhalb Services

### 4. Domain Events (Optional)
Für zukünftige Erweiterungen:
- Event: `TaskCompleted` → Trigger: Update Dashboard, Notify Manager
- Event: `EquipmentMaintenanceDue` → Trigger: Create Task
- Event: `SensorThresholdExceeded` → Trigger: Alert

## Data Flow Examples

### Task Lifecycle
```
1. User: POST /api/tasks
   ↓
2. API Handler: Validate Input (Zod)
   ↓
3. taskService.createTask()
   ↓
4. Prisma: INSERT Task
   ↓
5. taskService.logEvent('CREATED')
   ↓
6. Return: 201 Created
```

### Equipment Check-Out via QR
```
1. Mobile: POST /api/qr/equipment/check-out {equipmentCode}
   ↓
2. API: Find Equipment by Code
   ↓
3. equipmentService.startUsage(equipmentId, userId)
   ↓
4. Prisma: INSERT EquipmentUsageLog (startTime)
   ↓
5. Return: 200 OK
```

## Security Architecture

### Authentication
- **Login**: POST /api/auth/login → Returns Access (15min) + Refresh (7d) Token
- **Refresh**: POST /api/auth/refresh → Returns new Access Token
- **Storage**: Refresh Token in httpOnly Cookie, Access Token in Memory/LocalStorage

### Authorization
- **Middleware**: `withAuth()` checks JWT validity
- **RBAC**: `requireRole(['HEAD_GREENKEEPER', 'MANAGER'])` guards endpoints
- **Row-Level**: Users can only modify their own assigned tasks (unless elevated role)

## Testing Strategy

### Unit Tests
- Domain Logic in Services
- Pure Functions (validators, transformers)
- **Tool**: Vitest

### Integration Tests
- API Endpoints (with test DB)
- Service Layer with Prisma
- **Tool**: Vitest + Supertest-equivalent

### E2E Tests (Future)
- Critical User Journeys
- **Tool**: Playwright

## Extensibility Points

### 1. IoT Integration
- `/src/modules/sensors/ingest`: Endpoint für Sensor-Daten
- Webhook-Handler für externe Devices
- Batch-Import für historische Daten

### 2. External APIs
- Weather: `/src/lib/integrations/weather`
- Payment (für Material-Bestellungen): `/src/lib/integrations/payment`

### 3. Reporting
- Custom Query Builder für Ad-hoc Reports
- Scheduled Reports (Cron Jobs)
- Export-Formate: PDF, CSV, Excel

### 4. Mobile App
- Shared Types (`/src/types`)
- API-First Design: Mobile nutzt identische Endpoints
- Optimistic UI Updates via WebSockets

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────┐
│         Vercel / Cloud Provider         │
│  ┌────────────────────────────────────┐ │
│  │      Next.js App (Serverless)     │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Managed PostgreSQL (e.g. Neon, RDS)  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Redis Cloud (Upstash, ElastiCache)   │
└─────────────────────────────────────────┘
```

## Monitoring & Observability (Future)
- **Logging**: Structured JSON logs (Pino/Winston)
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Alerts**: Equipment maintenance overdue, Sensor anomalies
