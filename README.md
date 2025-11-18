# Golf Greenkeeper - Digital Platzpflege & Maintenance Management

Digitales Management-System für Golfplatz-Pflege und -Wartung.

## Features

- 📋 **Task Management**: Tages- und Wochenaufgaben digital verwalten
- 🚜 **Equipment Tracking**: Maschinen-Nutzung und -Wartung nachverfolgen
- 🏌️ **Location Management**: Greens, Fairways, Bunker als Zonen modellieren
- 📱 **QR-Code Workflows**: Schnelle Check-ins für Tasks und Equipment
- 🌡️ **IoT Integration**: Bodenfeuchte, Wetter-Sensoren anbinden
- 📊 **Reports & KPIs**: Kosten, Arbeitszeiten, Ressourcenverbrauch

## Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Testing**: Vitest + Testing Library (TDD)
- **Auth**: JWT (Access + Refresh), Argon2
- **CI/CD**: GitHub Actions

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials and secrets

# Setup database (generates Prisma client, runs migrations, seeds data)
npm run db:setup

# Run development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Default Login Credentials

After seeding the database, you can login with these accounts:

- **Admin**: `admin@golfclub-siek.de` / `Admin123!`
- **Manager**: `manager@golfclub-siek.de` / `Manager123!`
- **Head Greenkeeper**: `head@golfclub-siek.de` / `Head123!`
- **Greenkeeper**: `greenkeeper1@golfclub-siek.de` / `Green123!`

## Project Structure

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Route Handlers
│   │   │   ├── tasks/
│   │   │   ├── equipment/
│   │   │   ├── locations/
│   │   │   └── auth/
│   │   └── _components/       # Shared UI Components
│   ├── modules/               # Domain Modules
│   │   ├── tasks/
│   │   │   ├── services/      # Business Logic
│   │   │   ├── types/         # TypeScript Types
│   │   │   └── validators/    # Zod Schemas
│   │   ├── equipment/
│   │   ├── locations/
│   │   ├── materials/
│   │   ├── weather/
│   │   ├── sensors/
│   │   ├── reports/
│   │   └── auth/
│   └── lib/                   # Shared Utilities
│       ├── db.ts             # Prisma Client
│       ├── redis.ts          # Redis Client
│       ├── auth/             # JWT Utilities
│       └── config/           # Configuration
├── prisma/
│   ├── schema.prisma         # Database Schema
│   └── migrations/           # DB Migrations
├── tests/                    # Test Files
└── .github/
    └── workflows/            # CI/CD Pipelines
```

## Domain Modules

### core/locations
Golfplatz-Topologie (Course, Holes, Zones)

### core/tasks
Arbeitsaufträge mit Status-Lifecycle

### core/equipment
Maschinen, Wartungspläne, Betriebsstunden

### core/materials
Dünger, Chemikalien, Lagerbestände

### core/weather
Wetterdaten und Forecasts

### core/sensors
IoT-Devices und Sensor-Readings

### core/reports
KPIs, Dashboards, Exports

### auth/users
User, Rollen, Permissions

## User Roles

- **GREENKEEPER**: Basis-Mitarbeiter
- **HEAD_GREENKEEPER**: Team-Lead, kann Tasks erstellen
- **MANAGER**: Management-Ebene, Reports
- **ADMIN**: System-Administration

## Development Workflow

1. **TDD-First**: Schreibe Tests vor Implementierung
2. **Module-basiert**: Jedes Feature in eigenem Modul
3. **API-First**: Backend-Endpoints vor UI
4. **Type-Safe**: Prisma Types + Zod Validation

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

## API Documentation

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks (filtered)
- `PATCH /api/tasks/:id/status` - Update status

### Equipment
- `POST /api/equipment` - Register equipment
- `POST /api/equipment/:id/usage/start` - Check-out
- `POST /api/equipment/:id/usage/stop` - Check-in

### Locations
- `POST /api/locations` - Create zone
- `GET /api/locations` - List zones

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### QR Workflows
- `POST /api/qr/equipment/check-out` - Equipment QR check-out
- `POST /api/qr/equipment/check-in` - Equipment QR check-in
- `POST /api/qr/location/check-in` - Location/Task QR check-in

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture and design decisions
- [API Documentation](./API.md) - Complete API reference
- [Development Guide](./DEVELOPMENT.md) - Development setup and workflows

## Current Implementation Status

### ✅ Completed Features

- **Domain Model**: Complete Prisma schema with all entities
- **Task Management**: Full CRUD + status lifecycle with validation
- **Location Management**: Hierarchical course structure
- **Equipment Management**: Check-in/check-out workflows
- **Authentication**: JWT-based auth with access + refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **QR Code Workflows**: Equipment and task QR check-in/check-out
- **Testing**: Unit tests for core business logic
- **CI/CD**: GitHub Actions pipeline (lint, test, build)

### 🚧 Ready for Implementation

- Materials/Chemicals tracking
- Weather integration
- Sensor/IoT integration
- Reports & Analytics
- WebSocket real-time updates
- Mobile-optimized UI
- PDF/CSV exports

## Tech Highlights

- **Type-Safe**: End-to-end TypeScript with Prisma
- **TDD**: Test-driven development approach
- **Clean Architecture**: Separation of concerns (API → Service → Persistence)
- **Secure**: Argon2 password hashing, JWT tokens, httpOnly cookies
- **Scalable**: Modular structure, ready for microservices
- **Production-Ready**: CI/CD, migrations, seeding, error handling

## Next Steps

1. **Setup Database**: Configure PostgreSQL and run migrations
2. **Test APIs**: Use the seed data to test all endpoints
3. **Customize**: Adapt to your specific course structure
4. **Deploy**: Use the GitHub Actions pipeline for deployment
5. **Extend**: Add materials, weather, reports as needed

## License

MIT
