# API Documentation

Complete API reference for the Golf Greenkeeper Management System.

**Base URL**: `http://localhost:3000/api`

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe",
  "role": "GREENKEEPER"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "GREENKEEPER"
  }
}
```

### POST /api/auth/login
Login and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "GREENKEEPER"
    }
  }
}
```

### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

---

## 📋 Tasks

### GET /api/tasks
Get all tasks with optional filters.

**Query Parameters:**
- `status` - Filter by status (TODO, IN_PROGRESS, COMPLETED)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `zoneId` - Filter by zone
- `assignedTo` - Filter by assigned user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-id",
      "title": "Grünpflege Loch 3",
      "description": "Aerifizieren und Top-Dressing",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2025-01-20T00:00:00Z",
      "zone": {
        "id": "zone-3",
        "name": "Green 3"
      },
      "assignedTo": {
        "id": "user-id",
        "name": "John Doe"
      }
    }
  ]
}
```

### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Grünpflege Loch 3",
  "description": "Aerifizieren und Top-Dressing",
  "priority": "HIGH",
  "dueDate": "2025-01-20",
  "estimatedHours": 4,
  "zoneId": "zone-3",
  "assignedTo": "user-id",
  "checklist": [
    "Aerifizierung durchführen",
    "Top-Dressing ausbringen"
  ]
}
```

### PATCH /api/tasks/[id]/start
Start a task (TODO → IN_PROGRESS).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task-id",
    "status": "IN_PROGRESS",
    "actualStart": "2025-01-18T10:00:00Z"
  }
}
```

### PATCH /api/tasks/[id]/complete
Complete a task (IN_PROGRESS → COMPLETED).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task-id",
    "status": "COMPLETED",
    "actualEnd": "2025-01-18T14:00:00Z"
  }
}
```

---

## 🚜 Equipment

### GET /api/equipment
Get all equipment.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "equipment-id",
      "name": "Rasenmäher Toro 2000",
      "type": "MOWER",
      "status": "ACTIVE",
      "operatingHours": 120,
      "lastMaintenance": "2025-01-01T00:00:00Z",
      "nextMaintenance": "2025-02-01T00:00:00Z"
    }
  ]
}
```

### POST /api/equipment
Register new equipment.

**Request Body:**
```json
{
  "name": "Rasenmäher Toro 2000",
  "type": "MOWER",
  "manufacturer": "Toro",
  "model": "Greensmaster 2000",
  "serialNumber": "TM2000-12345",
  "purchaseDate": "2024-01-01",
  "purchasePrice": 25000,
  "maintenanceIntervalHours": 100
}
```

### POST /api/equipment/[id]/log-usage
Log equipment usage.

**Request Body:**
```json
{
  "hours": 2.5,
  "taskId": "task-id",
  "userId": "user-id",
  "notes": "Hole 1-9 gemäht"
}
```

---

## 📦 Materials

### GET /api/materials
Get all materials.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "material-id",
      "name": "Premium Dünger NPK 15-15-15",
      "type": "FERTILIZER",
      "unit": "kg",
      "currentStock": 50,
      "minStock": 10,
      "maxStock": 100,
      "costPerUnit": 12.5,
      "isHazardous": false
    }
  ]
}
```

### POST /api/materials
Add new material.

**Request Body:**
```json
{
  "name": "Premium Dünger NPK 15-15-15",
  "type": "FERTILIZER",
  "description": "Premium Langzeitdünger",
  "unit": "kg",
  "currentStock": 50,
  "minStock": 10,
  "maxStock": 100,
  "costPerUnit": 12.5,
  "supplier": "GreenTech GmbH",
  "isHazardous": false
}
```

### POST /api/materials/[id]/add
Add stock to material.

**Request Body:**
```json
{
  "quantity": 25,
  "notes": "Nachlieferung"
}
```

### POST /api/materials/[id]/remove
Remove stock (for application).

**Request Body:**
```json
{
  "quantity": 10,
  "zoneId": "zone-1",
  "taskId": "task-id",
  "applicationRate": 2.5,
  "notes": "Anwendung auf Green 1"
}
```

### GET /api/materials/low-stock
Get materials with low stock.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "material-id",
      "name": "Premium Dünger NPK 15-15-15",
      "currentStock": 8,
      "minStock": 10
    }
  ]
}
```

---

## 🗺️ Locations & Zones

### GET /api/zones
Get all zones.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "zone-id",
      "name": "Green 1",
      "type": "GREEN",
      "holeNumber": 1,
      "area": 500,
      "latitude": 53.6394,
      "longitude": 10.2931
    }
  ]
}
```

### POST /api/zones
Create new zone.

**Request Body:**
```json
{
  "name": "Green 1",
  "type": "GREEN",
  "holeNumber": 1,
  "area": 500,
  "latitude": 53.6394,
  "longitude": 10.2931,
  "radius": 50
}
```

---

## 🌡️ Weather

### POST /api/weather/sync
Sync weather data from OpenWeather API.

**Request Body:**
```json
{
  "lat": 53.6394,
  "lon": 10.2931
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "temperature": 18.5,
    "humidity": 65,
    "precipitation": 0,
    "windSpeed": 12,
    "windDirection": "NW",
    "conditions": "Partly cloudy",
    "evapotranspiration": 4.2,
    "irrigationRecommendation": "NORMAL"
  }
}
```

---

## 📊 Reports

### GET /api/reports/dashboard
Get dashboard summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": {
      "pending": 5,
      "inProgress": 3,
      "completed": 12
    },
    "equipment": {
      "active": 8,
      "maintenanceDue": 2
    },
    "materials": {
      "lowStock": 3
    },
    "weather": {
      "temperature": 18.5
    }
  }
}
```

### GET /api/reports/task
Task report with date range.

**Query Parameters:**
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 50,
    "completedTasks": 35,
    "inProgressTasks": 10,
    "overdueTask": 5,
    "completionRate": 70,
    "averageCompletionTime": 3.5,
    "tasksByPriority": {
      "LOW": 10,
      "MEDIUM": 25,
      "HIGH": 12,
      "URGENT": 3
    }
  }
}
```

### GET /api/reports/equipment
Equipment usage report.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEquipment": 15,
    "activeEquipment": 12,
    "totalOperatingHours": 1250,
    "averageHoursPerEquipment": 83,
    "maintenanceDue": 3,
    "usageByType": {
      "MOWER": {
        "count": 5,
        "totalHours": 600
      }
    }
  }
}
```

### GET /api/reports/material
Material consumption report.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMaterials": 25,
    "lowStockItems": 3,
    "totalApplications": 150,
    "topConsumers": [
      {
        "materialName": "Premium Dünger",
        "quantity": 500,
        "unit": "kg"
      }
    ]
  }
}
```

---

## 📡 Sensors (IoT)

### GET /api/sensors
Get all sensor devices.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sensor-id",
      "deviceId": "SM-GRN-001",
      "name": "Green 1 Soil Moisture",
      "type": "SOIL_MOISTURE",
      "zoneId": "zone-1",
      "status": "ACTIVE",
      "lastReading": {
        "value": 45,
        "unit": "%",
        "timestamp": "2025-01-18T10:00:00Z"
      },
      "battery": 85,
      "signal": 92
    }
  ]
}
```

### GET /api/sensors/[id]/readings
Get sensor reading history.

**Query Parameters:**
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `limit` - Max number of readings (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "reading-id",
      "sensorId": "sensor-id",
      "value": 45,
      "unit": "%",
      "timestamp": "2025-01-18T10:00:00Z",
      "battery": 85,
      "signal": 92
    }
  ],
  "meta": {
    "sensorId": "sensor-id",
    "count": 100
  }
}
```

### POST /api/sensors/publish
Publish command to sensor via MQTT.

**Request Body:**
```json
{
  "deviceId": "SM-GRN-001",
  "topic": "command",
  "message": {
    "action": "calibrate"
  }
}
```

---

## 🔔 WebSocket Events

Connect to WebSocket: `ws://localhost:3000/ws?token=YOUR_JWT_TOKEN`

### Event Types

#### TASK_CREATED
```json
{
  "type": "TASK_CREATED",
  "data": {
    "id": "task-id",
    "title": "New Task",
    "status": "TODO"
  }
}
```

#### TASK_STATUS_CHANGED
```json
{
  "type": "TASK_STATUS_CHANGED",
  "data": {
    "id": "task-id",
    "status": "IN_PROGRESS"
  }
}
```

#### SENSOR_DATA
```json
{
  "type": "SENSOR_DATA",
  "data": {
    "deviceId": "SM-GRN-001",
    "value": 45,
    "unit": "%",
    "timestamp": "2025-01-18T10:00:00Z"
  }
}
```

#### SENSOR_ALERT
```json
{
  "type": "SENSOR_ALERT",
  "data": {
    "deviceId": "SM-GRN-001",
    "zoneId": "zone-1",
    "alerts": [
      "Niedrige Bodenfeuchtigkeit: 28%"
    ],
    "timestamp": "2025-01-18T10:00:00Z"
  }
}
```

---

## ❌ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict
- `INTERNAL_ERROR` (500) - Server error

---

## 📝 Rate Limiting

API endpoints are rate limited to:
- **100 requests per minute** per IP address
- **1000 requests per hour** per authenticated user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705579200
```

---

**API Version**: 1.0
**Last Updated**: 2025-01-18
