# Golf Greenkeeper Management System

**Digitales Platzpflege- & Maintenance-Management-System** für Golfplätze mit Fokus auf Tasks, Equipment, IoT, Zonen und Sensorik.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tests](https://img.shields.io/badge/Tests-70%20passing-green)
![License](https://img.shields.io/badge/license-ISC-blue)

---

## 🎯 Features

### ✅ Core Features
- **Task Management** mit Status-Machine (TODO → IN_PROGRESS → COMPLETED)
- **Equipment Tracking** mit Wartungsintervallen und Betriebsstunden
- **Material Inventory** mit Bestandsverwaltung und Low-Stock Alerts
- **Location & Zone Management** für 18-Loch Golfplatz
- **Sensor Integration** (MQTT) für Bodenfeuchtigkeit, Temperatur, pH-Wert
- **Weather Integration** (OpenWeather API) mit Evapotranspiration-Berechnung
- **Reports & Analytics** mit PDF/Excel Export

### 🔐 Security & Auth
- **JWT Authentication** (Access + Refresh Tokens)
- **Argon2 Password Hashing**
- **Role-Based Access Control** (ADMIN, MANAGER, GREENKEEPER, VIEWER)

### 📊 Frontend Features
- **Advanced Dashboard** mit Chart.js (Line, Bar, Doughnut)
- **Equipment Management UI** mit Filtern und CRUD
- **Material Management UI** mit Stock-Visualisierung
- **Reports UI** mit PDF/Excel Export
- **Interactive Maps** (Leaflet) mit Zone-Visualisierung
- **QR Scanner** (HTML5 QR Code) für Equipment & Materialien
- **Notification Center** mit Prioritätsstufen
- **PWA Support** (Progressive Web App) mit Service Worker

### 📱 Mobile App (React Native)
- Native iOS & Android via Expo
- Task Management
- Equipment & Material Tracking
- QR Code Scanner
- Real-time Updates

### 🔌 Real-time Features
- **WebSocket Server** für Live-Updates
- **MQTT Broker** Integration für IoT-Sensoren
- **Push Notifications** (in Vorbereitung)

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- MQTT Broker (optional, z.B. Mosquitto)

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/golf-greenkeeper.git
cd golf-greenkeeper

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev --name init
npx prisma generate

# Start development server
npm run dev
```

Server läuft auf: http://localhost:3000

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/golf_greenkeeper"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secrets
JWT_ACCESS_SECRET="your-access-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# OpenWeather API
OPENWEATHER_API_KEY="your-openweather-api-key"

# MQTT Broker
MQTT_BROKER_URL="mqtt://localhost:1883"
MQTT_USERNAME="mqtt_user"
MQTT_PASSWORD="mqtt_password"
```

---

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Backend unit tests only
npm run test:unit

# Frontend component tests
npm run test:ui

# With coverage
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/
│   ├── tasks/       # 31 tests
│   ├── materials/   # 11 tests
│   └── weather/     # 4 tests
└── ui/
    ├── dashboard.test.tsx    # 6 tests
    ├── equipment.test.tsx    # 7 tests
    └── materials.test.tsx    # 11 tests
```

**Current Test Coverage**: 70 tests passing

---

## 📖 Documentation

- [API Documentation](./docs/API.md) - Detailed API reference
- [Developer Guide](./docs/DEVELOPER.md) - Development guidelines
- [Architecture](./ARCHITECTURE.md) - System architecture
- [Mobile App](./mobile/README.md) - React Native app

---

## 📱 Mobile App

See [mobile/README.md](./mobile/README.md) for React Native app documentation.

Quick start:
```bash
cd mobile
npm install
npm start
```

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL mit Prisma ORM
- **Cache**: Redis
- **Testing**: Vitest + React Testing Library
- **Auth**: JWT (Access + Refresh)
- **Real-time**: WebSockets + MQTT
- **CI/CD**: GitHub Actions

### Domain-Driven Design
```
src/modules/
├── tasks/          # Task Domain
├── equipment/      # Equipment Domain
├── materials/      # Material Domain
├── locations/      # Location & Zone Domain
├── weather/        # Weather Domain
├── reports/        # Reports & Analytics
└── sensors/        # Sensor Domain (IoT)
```

---

## 🛠️ Development

### Key Scripts
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm test             # Run all tests
npm run lint         # Lint code
npm run db:push      # Push Prisma schema to DB
npm run db:studio    # Open Prisma Studio
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

ISC License

---

## 👥 Authors

**Golf Greenkeeper Team**
- Golfplatz Siek, Germany
- Built with ❤️ using Next.js, TypeScript, and modern web technologies

---

**🏌️ Made for Golfplatz Siek - Digitalisierung der Platzpflege**
