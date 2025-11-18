# API Endpoints

Vollständige Übersicht aller verfügbaren API-Endpoints.

## Authentication

### POST /api/auth/register
Neuen Benutzer registrieren
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "GREENKEEPER"
}
```

### POST /api/auth/login
Einloggen und JWT-Tokens erhalten
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### POST /api/auth/refresh
Access-Token erneuern
```json
{
  "refreshToken": "your-refresh-token"
}
```

## Tasks

### GET /api/tasks
Aufgaben abrufen (mit Filtern)
- Query params: `status`, `assignedToId`, `zoneId`, `page`, `limit`

### POST /api/tasks
Neue Aufgabe erstellen
```json
{
  "title": "Mow Green 1",
  "description": "Regular morning mow",
  "priority": "HIGH",
  "zoneId": "zone-uuid",
  "assignedToId": "user-uuid",
  "scheduledStart": "2025-01-15T08:00:00Z",
  "estimatedHours": 2
}
```

### GET /api/tasks/:id
Einzelne Aufgabe abrufen

### PATCH /api/tasks/:id/status
Task-Status ändern
```json
{
  "status": "IN_PROGRESS",
  "notes": "Starting task now"
}
```

## Locations

### GET /api/locations
Alle Zonen abrufen
- Query params: `type` (GREEN, FAIRWAY, etc.)

### POST /api/locations
Neue Zone erstellen
```json
{
  "name": "Green 1",
  "type": "GREEN",
  "holeId": "hole-uuid",
  "area": 450.5,
  "description": "First green"
}
```

## Equipment

### GET /api/equipment
Equipment-Liste abrufen
- Query params: `status`

### POST /api/equipment
Neues Equipment registrieren
```json
{
  "name": "Fairway Mower 1",
  "type": "MOWER",
  "manufacturer": "John Deere",
  "serviceInterval": 50
}
```

### POST /api/equipment/:id/usage/start
Equipment-Nutzung starten
```json
{
  "zoneId": "zone-uuid",
  "notes": "Mowing fairway 1"
}
```

### POST /api/equipment/usage/:logId/stop
Equipment-Nutzung beenden
```json
{
  "endHours": 125.5,
  "notes": "Completed"
}
```

## Materials

### GET /api/materials
Materialien-Liste abrufen
- Query params: `type`

### POST /api/materials
Neues Material anlegen
```json
{
  "name": "NPK Fertilizer 15-15-15",
  "type": "FERTILIZER",
  "unit": "kg",
  "initialStock": 500,
  "minStock": 100,
  "unitCost": 2.5
}
```

### POST /api/materials/:id/stock
Bestand auffüllen
```json
{
  "quantity": 200,
  "reason": "Purchase order #123"
}
```

### POST /api/materials/apply
Material anwenden
```json
{
  "materialId": "material-uuid",
  "zoneId": "zone-uuid",
  "quantity": 25,
  "notes": "Spring fertilization"
}
```

### GET /api/materials/low-stock
Materialien mit niedrigem Bestand

## Weather

### GET /api/weather
Aktuelle Wetterdaten oder Historie abrufen
- Query params: `dateFrom`, `dateTo` (optional)

### POST /api/weather
Wetterdaten manuell erfassen
```json
{
  "temperature": 22.5,
  "humidity": 65,
  "precipitation": 0,
  "windSpeed": 12,
  "source": "MANUAL"
}
```

### GET /api/weather/irrigation-recommendation
Bewässerungs-Empfehlung basierend auf Wetter

## Sensors

### GET /api/sensors
Alle Sensor-Geräte abrufen

### POST /api/sensors
Neuen Sensor registrieren
```json
{
  "code": "SENS-001",
  "name": "Green 1 Soil Moisture",
  "type": "SOIL_MOISTURE",
  "zoneId": "zone-uuid"
}
```

### GET /api/sensors/:id/readings
Sensor-Messwerte abrufen
- Query params: `dateFrom`, `dateTo` (optional)

### POST /api/sensors/:id/readings
Messwert erfassen
```json
{
  "value": 45.2,
  "unit": "%"
}
```

### GET /api/sensors/alerts
Aktuelle Sensor-Alarme
- Query params: `deviceId` (optional)

## Reports

### GET /api/reports/dashboard
Komplettes Dashboard mit allen KPIs

### GET /api/reports/tasks
Task-Summary Report
- Query params: `dateFrom`, `dateTo` (optional)

### GET /api/reports/equipment
Equipment-Usage Report

### GET /api/reports/materials
Material-Consumption Report
- Query params: `dateFrom`, `dateTo` (optional)

## QR-Code Integration

### GET /api/qr/equipment/:code
Equipment-Info per QR-Code abrufen

### GET /api/qr/location/:code
Location-Info + zugehörige Tasks per QR-Code

### GET /api/qr/task/:code
Task-Info per QR-Code

## WebSocket

### WS /ws?token=YOUR_ACCESS_TOKEN
WebSocket-Verbindung für Real-time Updates

Events:
- `task_updated` - Task-Status geändert
- `equipment_updated` - Equipment-Status geändert
- `sensor_alert` - Neuer Sensor-Alarm
- `low_stock_alert` - Niedriger Materialbestand

### GET /api/ws/status
WebSocket-Server Status

## Authentication

Alle Endpoints (außer /api/auth/*) benötigen einen JWT Access Token:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Rollen & Permissions

- **ADMIN**: Vollzugriff
- **MANAGER**: Reports, Planung, Equipment/Material-Verwaltung
- **HEAD_GREENKEEPER**: Tasks erstellen/zuweisen, Equipment verwalten
- **GREENKEEPER**: Eigene Tasks ausführen, Equipment nutzen
