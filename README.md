# Golf Greenkeeper - Digitales Platzpflege-Management

Ein umfassendes Management-System für Golfplatz-Wartung und -Pflege.

## Features

### Core Modules
- 🎯 **Task Management**: Digitale Tages- und Wochenaufgaben mit State Machine (TODO → IN_PROGRESS → COMPLETED)
- 🚜 **Equipment Tracking**: Maschinen-Nutzung, Wartung und Betriebsstunden-Tracking
- 🗺️ **Location Mapping**: Zonen (Greens, Fairways, Bunker, Tees, Roughs)
- 📱 **QR-Code Integration**: Schnelle Workflows für Tasks, Equipment und Locations
- 🧪 **Material Management**: Lagerbestand, Verbrauch und Anwendungs-Tracking
- 🌡️ **Weather Integration**: Wetterdaten mit Evapotranspiration und Bewässerungs-Empfehlungen
- 📡 **IoT & Sensoren**: Bodenfeuchte-, Temperatur- und Niederschlagssensoren mit Alerts
- 📊 **Reports & Analytics**: Umfassende KPIs für Tasks, Equipment, Materialien und Workforce
- ⚡ **Real-time Updates**: WebSocket-Server für Live-Benachrichtigungen

### Frontend
- 💻 **Dashboard UI**: Übersichtliches Dashboard mit KPI-Karten
- 📋 **Task Management UI**: Mobile-optimierte Aufgabenverwaltung
- 📱 **Responsive Design**: Funktioniert auf Desktop, Tablet und Smartphone

## Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript
- **Database**: PostgreSQL mit Prisma ORM
- **Cache**: Redis
- **Auth**: JWT (Access + Refresh), Argon2
- **Testing**: Vitest + Testing Library
- **CI/CD**: GitHub Actions

## Erste Schritte

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Installation

```bash
# Dependencies installieren
npm install

# Environment-Variablen kopieren und anpassen
cp .env.example .env

# Datenbank-Schema initialisieren
npm run db:push

# Seed-Daten laden (optional)
npm run db:seed

# Development-Server starten
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

### Datenbank-Befehle

```bash
# Prisma Schema generieren
npm run db:generate

# Migration erstellen
npm run db:migrate

# Prisma Studio öffnen
npm run db:studio
```

### Testing

```bash
# Tests ausführen
npm test

# Tests mit UI
npm run test:ui

# Coverage Report
npm run test:coverage
```

## Architektur

Siehe [ARCHITECTURE.md](./ARCHITECTURE.md) für detaillierte Architektur-Dokumentation.

### Verzeichnisstruktur

```
src/
├── app/              # Next.js App Router (Pages + API Routes)
├── modules/          # Domain-Module (DDD)
├── lib/              # Shared utilities
└── types/            # Shared TypeScript types
```

## Rollen & Permissions

- **ADMIN**: Vollzugriff
- **MANAGER**: Reports, Planung, Kosten-Übersicht
- **HEAD_GREENKEEPER**: Tasks erstellen/zuweisen, Equipment-Verwaltung
- **GREENKEEPER**: Tasks ausführen, Equipment nutzen

## Development

Dieses Projekt folgt **Test-Driven Development (TDD)**:
1. Test schreiben (failing)
2. Implementierung (passing)
3. Refactoring

Commit-Messages folgen [Conventional Commits](https://www.conventionalcommits.org/).

## CI/CD

GitHub Actions führt automatisch aus:
- Linting
- Type-Checking
- Unit & Integration Tests
- Build-Validierung

## Lizenz

Proprietär - Golfplatz Siek
