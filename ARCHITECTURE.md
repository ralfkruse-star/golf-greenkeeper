# Golf Greenkeeper - System Architecture

## Übersicht
Digitales Platzpflege- und Maintenance-Management-System für Golfplätze.

## Tech Stack
- **Frontend/Backend**: Next.js 14 (App Router), TypeScript
- **Database**: PostgreSQL mit Prisma ORM
- **Cache**: Redis (Sessions, Caching, Live-Daten)
- **Authentication**: JWT (Access + Refresh Token), Argon2 für Passwörter
- **Testing**: Vitest + Testing Library (TDD-Ansatz)
- **Realtime**: WebSockets (Next.js Route Handler)
- **CI/CD**: GitHub Actions

## Domain-Driven Design - Bounded Contexts

### 1. core/locations
**Verantwortung**: Verwaltung von Platz-Strukturen
- **Entities**: Course, Hole, Zone
- **Value Objects**: Coordinates, Area, ZoneType
- **Services**: LocationService
- **Use Cases**:
  - Zone anlegen (Green, Fairway, Bunker, Tee, Rough)
  - Hierarchie Course → Holes → Zones
  - Geometrien/Koordinaten verwalten

### 2. core/tasks
**Verantwortung**: Arbeitsaufträge und deren Lifecycle
- **Entities**: Task, WorkOrder, TaskLog, Checklist
- **Aggregates**: Task (mit TaskLogs, Checklists)
- **Services**: TaskService, TaskLifecycleService
- **Use Cases**:
  - Task erstellen, zuweisen, starten, abschließen
  - Statuswechsel mit Validierung (TODO → IN_PROGRESS → COMPLETED)
  - Zeiterfassung (geplant vs. tatsächlich)
  - Checklisten abarbeiten
  - Fotos/Dokumentation anhängen

**State Machine**:
```
TODO → IN_PROGRESS → COMPLETED
  ↓                      ↑
  └──→ ON_HOLD ────────┘
  ↓
CANCELLED
```

### 3. core/equipment
**Verantwortung**: Maschinen, Werkzeuge und deren Wartung
- **Entities**: Equipment, UsageLog, MaintenancePlan, MaintenanceEvent
- **Services**: EquipmentService, MaintenanceService
- **Use Cases**:
  - Equipment registrieren (Mäher, Fahrzeuge, Werkzeuge)
  - Nutzung tracken (Check-out/Check-in, Betriebsstunden)
  - Wartungspläne definieren (intervallbasiert)
  - Wartungen dokumentieren
  - Equipment-Status überwachen

### 4. core/materials
**Verantwortung**: Verbrauchsmaterialien und deren Anwendung
- **Entities**: Material, Inventory, MaterialApplication
- **Value Objects**: Unit, Quantity
- **Services**: MaterialService, InventoryService
- **Use Cases**:
  - Materialien katalogisieren (Dünger, Pestizide, Sand, Saatgut)
  - Lagerbestände verwalten
  - Anwendungen dokumentieren (wo, wann, wieviel, wer)
  - Verbrauchsanalysen

### 5. core/weather
**Verantwortung**: Wetterdaten und Forecasts
- **Entities**: WeatherSnapshot, Forecast
- **Services**: WeatherService, WeatherAPIAdapter
- **Use Cases**:
  - Aktuelle Wetterdaten erfassen
  - Historische Daten speichern
  - Externe APIs integrieren (OpenWeather, etc.)
  - Evapotranspiration (ET) berechnen

### 6. core/sensors
**Verantwortung**: IoT-Sensordaten
- **Entities**: SensorDevice, SensorReading
- **Services**: SensorService, SensorIngestionService
- **Use Cases**:
  - Sensoren registrieren (Bodenfeuchte, Temperatur)
  - Messwerte speichern (Time-Series)
  - Schwellwert-Alarme
  - Daten-Aggregation

### 7. core/reports
**Verantwortung**: KPIs, Analytics, Exports
- **Entities**: ReportDefinition, GeneratedReport
- **Services**: ReportService, AggregationService
- **Use Cases**:
  - Arbeitszeit-Reports
  - Equipment-Nutzungsstatistiken
  - Material-Verbrauch
  - Kosten-Tracking
  - PDF/Excel-Export

### 8. auth/users
**Verantwortung**: Authentifizierung und Autorisierung
- **Entities**: User, Role, Permission, Session
- **Services**: AuthService, UserService, RoleService
- **Roles**:
  - `ADMIN`: Vollzugriff
  - `MANAGER`: Reports, Planung, Kosten
  - `HEAD_GREENKEEPER`: Tasks erstellen/zuweisen, Equipment-Verwaltung
  - `GREENKEEPER`: Tasks ausführen, Equipment nutzen
- **Use Cases**:
  - Login/Logout (JWT-basiert)
  - Token-Refresh
  - Rollenbasierte Zugriffskontrolle
  - Passwort-Management

## Layered Architecture

```
┌─────────────────────────────────────────┐
│   Presentation Layer (Next.js)          │
│   - API Routes (/api/*)                 │
│   - Pages/Components (App Router)       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Application Layer                     │
│   - Use Case Services                   │
│   - DTOs, Validators                    │
│   - Auth Middleware                     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Domain Layer                          │
│   - Domain Models (Entities)            │
│   - Business Logic                      │
│   - Domain Services                     │
│   - Domain Events                       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Infrastructure Layer                  │
│   - Prisma (Database)                   │
│   - Redis (Cache)                       │
│   - External APIs                       │
│   - File Storage                        │
└─────────────────────────────────────────┘
```

## Directory Structure

```
/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   ├── tasks/
│   │   │   ├── locations/
│   │   │   ├── equipment/
│   │   │   ├── materials/
│   │   │   ├── weather/
│   │   │   ├── sensors/
│   │   │   ├── reports/
│   │   │   └── qr/
│   │   ├── (dashboard)/              # Protected routes
│   │   └── layout.tsx
│   ├── modules/                      # Domain modules
│   │   ├── auth/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── tasks/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── services/
│   │   │   │   └── events/
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   └── dtos/
│   │   │   └── infrastructure/
│   │   ├── locations/
│   │   ├── equipment/
│   │   ├── materials/
│   │   ├── weather/
│   │   ├── sensors/
│   │   └── reports/
│   ├── lib/                          # Shared utilities
│   │   ├── db/                       # Prisma client
│   │   ├── redis/                    # Redis client
│   │   ├── auth/                     # Auth utilities
│   │   ├── validation/               # Zod schemas
│   │   ├── errors/                   # Custom errors
│   │   └── utils/
│   └── types/                        # Shared TypeScript types
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .github/
│   └── workflows/
│       └── ci.yml
└── docs/
```

## Data Flow

### Example: Task Creation
```
1. POST /api/tasks (HTTP Request)
2. → API Route Handler validates JWT
3. → Extract/validate DTO (Zod)
4. → TaskApplicationService.createTask(dto)
5. → TaskService (domain) validates business rules
6. → TaskRepository.save(task)
7. → Prisma creates DB record
8. → Domain Event: TaskCreated
9. → Event handler: notify assigned user (future)
10. ← Return TaskDTO to client
```

## Security Considerations

1. **Authentication**: JWT mit kurzer Lebensdauer (Access: 15min, Refresh: 7d)
2. **Authorization**: Rollenbasiert, auf Route-Ebene
3. **Input Validation**: Zod-Schemas für alle API-Inputs
4. **SQL Injection**: Prisma parametrisiert automatisch
5. **XSS**: Next.js escaped automatisch, zusätzlich DOMPurify für User-Input
6. **CSRF**: SameSite Cookies für Tokens
7. **Rate Limiting**: Redis-basiert (future)
8. **Secrets**: Argon2 für Passwörter, env variables für Secrets

## QR-Code Integration

### Equipment QR Workflow
```
QR-Code auf Maschine (equipmentCode: "EQ-001")
  → Scan → POST /api/qr/equipment/check-out
  → EquipmentService.startUsage(equipmentId, userId, locationId)
  → Create UsageLog (start time)

  ... Nutzung ...

  → Scan → POST /api/qr/equipment/check-in
  → EquipmentService.endUsage(usageLogId, endLocation)
  → Update UsageLog (end time, operating hours)
```

### Location/Task QR Workflow
```
QR-Code an Zone (locationCode: "LOC-GREEN-01")
  → Scan → GET /api/qr/location/LOC-GREEN-01
  → Show assigned tasks for this location
  → Select task → POST /api/qr/task/start
  → TaskService.startTask(taskId)
```

## Future Extensions

1. **Real-time Updates**: WebSocket-Server für Live-Task-Status
2. **Time-Series DB**: Migration von Sensor-Daten zu TimescaleDB
3. **Mobile App**: React Native für native Apps (iOS/Android)
4. **Offline-First**: Service Worker + IndexedDB für Offline-Nutzung
5. **AI/ML**: Vorhersagen für Wartung, optimale Mäh-Zeiten
6. **Multi-Tenant**: Mehrere Golfclubs in einer Instanz
7. **GIS Integration**: Karten-basierte Visualisierung (Leaflet/Mapbox)
8. **External APIs**: Wetter, Bewässerungssysteme, ERP-Integration

## Development Principles

1. **Test-Driven Development**: Erst Tests, dann Implementation
2. **Domain-First**: Business-Logik in Domain-Layer, nicht in API-Routes
3. **Clean Code**: SOLID, DRY, KISS
4. **Type Safety**: Strict TypeScript, keine `any`
5. **API-First**: OpenAPI/Swagger-Dokumentation (future)
6. **Continuous Integration**: Jeder Commit wird getestet
7. **Semantic Versioning**: Versionierung nach SemVer
