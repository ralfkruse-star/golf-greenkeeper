# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Auth Endpoints

#### POST /api/auth/login
Login and receive access + refresh tokens.

**Request:**
```json
{
  "email": "greenkeeper1@golfclub-siek.de",
  "password": "Green123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "greenkeeper1@golfclub-siek.de",
      "firstName": "Peter",
      "lastName": "Müller",
      "role": "GREENKEEPER"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

#### POST /api/auth/logout
Logout and clear refresh token cookie.

#### GET /api/auth/me
Get current authenticated user (protected).

---

## Tasks

### POST /api/tasks
Create a new task.

**Request:**
```json
{
  "title": "Grün 1 mähen",
  "description": "Schnitthöhe 3.5mm, Kreuzschnitt",
  "priority": "HIGH",
  "scheduledStart": "2025-11-18T08:00:00Z",
  "locationId": "clxxx...",
  "assignedToId": "clxxx...",
  "equipmentId": "clxxx..."
}
```

### GET /api/tasks
List tasks with filters.

**Query Parameters:**
- `status` - TaskStatus (TODO, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED)
- `priority` - TaskPriority (LOW, MEDIUM, HIGH, URGENT)
- `assignedToId` - User ID
- `locationId` - Location ID
- `fromDate` - ISO date string
- `toDate` - ISO date string
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20)

**Example:**
```
GET /api/tasks?status=IN_PROGRESS&priority=HIGH&page=1&pageSize=20
```

### GET /api/tasks/:id
Get a single task by ID.

### PATCH /api/tasks/:id/status
Update task status.

**Request:**
```json
{
  "newStatus": "IN_PROGRESS",
  "notes": "Started working on this task"
}
```

### POST /api/tasks/:id/assign
Assign task to a user.

**Request:**
```json
{
  "assignedToId": "clxxx..."
}
```

### GET /api/tasks/:id/logs
Get all status change logs for a task.

---

## Locations

### POST /api/locations
Create a new location.

**Request:**
```json
{
  "name": "Grün 1",
  "code": "GCS-H01-GREEN",
  "type": "GREEN",
  "description": "Main green of hole 1",
  "parentId": "clxxx...",
  "latitude": 53.123456,
  "longitude": 10.123456,
  "area": 450.5
}
```

### GET /api/locations
List locations with filters.

**Query Parameters:**
- `type` - LocationType (COURSE, HOLE, GREEN, FAIRWAY, TEE, BUNKER, ROUGH, PRACTICE_AREA, OTHER)
- `parentId` - Parent location ID
- `active` - boolean

### GET /api/locations/:id
Get a single location by ID.

### GET /api/locations/hierarchy
Get the full course hierarchy (courses → holes → zones).

---

## Equipment

### POST /api/equipment
Register new equipment.

**Request:**
```json
{
  "name": "John Deere 7500 Fairway Mower",
  "code": "EQ-MOWER-001",
  "type": "Fairway Mower",
  "manufacturer": "John Deere",
  "model": "7500",
  "serialNumber": "JD7500-2020-001",
  "purchaseDate": "2020-03-15",
  "purchasePrice": 85000,
  "initialHours": 0
}
```

### GET /api/equipment
List equipment with filters.

**Query Parameters:**
- `status` - EquipmentStatus (AVAILABLE, IN_USE, MAINTENANCE, BROKEN, RETIRED)
- `type` - Equipment type string
- `active` - boolean

### GET /api/equipment/:id
Get a single equipment by ID.

### POST /api/equipment/:id/usage/start
Start equipment usage (check-out).

**Request:**
```json
{
  "locationId": "clxxx..."
}
```

### POST /api/equipment/:id/usage/stop
Stop equipment usage (check-in).

**Request:**
```json
{
  "hoursEnd": 1250.5,
  "notes": "Completed fairway mowing"
}
```

### GET /api/equipment/:id/usage/history
Get usage history for equipment.

**Query Parameters:**
- `limit` - Number of records (default: 50)

---

## QR Code Workflows

### POST /api/qr/equipment/check-out
Check out equipment using QR code.

**Request:**
```json
{
  "equipmentCode": "EQ-MOWER-001",
  "locationId": "clxxx..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Equipment checked out successfully",
    "equipment": {
      "id": "clxxx...",
      "name": "John Deere 7500 Fairway Mower",
      "code": "EQ-MOWER-001",
      "type": "Fairway Mower"
    },
    "usageLog": {
      "id": "clxxx...",
      "startTime": "2025-11-18T08:30:00Z",
      ...
    }
  }
}
```

### POST /api/qr/equipment/check-in
Check in equipment using QR code.

**Request:**
```json
{
  "equipmentCode": "EQ-MOWER-001",
  "hoursEnd": 1250.5,
  "notes": "Completed work"
}
```

### POST /api/qr/location/check-in
Check in to a location (optionally start a task).

**Request:**
```json
{
  "locationCode": "GCS-H01-GREEN",
  "taskId": "clxxx..."
}
```

### POST /api/qr/task/check-in
Start a task using QR code.

**Request:**
```json
{
  "taskCode": "TASK-001"
}
```

---

## Error Responses

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

### Common Error Codes:
- `VALIDATION_ERROR` - Input validation failed (400)
- `UNAUTHORIZED` - Authentication required or failed (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `NOT_FOUND` - Resource not found (404)
- `INTERNAL_ERROR` - Server error (500)

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Task Status Transitions

Valid status transitions:

```
TODO → ASSIGNED → IN_PROGRESS → COMPLETED
  ↓       ↓           ↓
CANCELLED CANCELLED  CANCELLED
```

**Invalid transitions:**
- TODO → COMPLETED (must go through IN_PROGRESS)
- COMPLETED → any (terminal state)
- CANCELLED → any (terminal state)

---

## User Roles

- **GREENKEEPER**: Basis-Mitarbeiter
  - Can view assigned tasks
  - Can start/complete own tasks
  - Can check equipment in/out

- **HEAD_GREENKEEPER**: Team-Lead
  - All GREENKEEPER permissions
  - Can create and assign tasks
  - Can view all tasks

- **MANAGER**: Management
  - All HEAD_GREENKEEPER permissions
  - Can access reports and analytics
  - Can manage materials and costs

- **ADMIN**: System Administrator
  - Full system access
  - Can manage users
  - Can configure system settings
