# Golf Greenkeeper - Digitales Platzpflege-Management

Ein umfassendes Management-System für Golfplatz-Wartung und -Pflege.

## Features

- 🎯 **Task Management**: Digitale Tages- und Wochenaufgaben für Greenkeeper
- 🚜 **Equipment Tracking**: Maschinen-Nutzung und Wartung
- 🗺️ **Location Mapping**: Zonen (Greens, Fairways, Bunker, Tees)
- 📱 **QR-Code Integration**: Workflows für Tasks und Equipment
- 🌡️ **IoT & Sensoren**: Bodenfeuchte, Wetter-Integration
- 📊 **Reports & KPIs**: Arbeitszeiten, Kosten, Material-Verbrauch

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
