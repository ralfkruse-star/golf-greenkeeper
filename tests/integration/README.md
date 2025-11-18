# Integration Tests

Integration tests for the Golf Greenkeeper API endpoints. These tests make real HTTP requests to the running application.

## Prerequisites

1. **Database**: PostgreSQL database must be running
2. **Application**: Next.js application must be running
3. **Seeded Data**: Database must be seeded with test data

## Setup

### 1. Start Database

```bash
# Using Docker Compose
docker-compose up -d postgres redis

# Or use local PostgreSQL
```

### 2. Run Migrations

```bash
npm run db:migrate
```

### 3. Seed Database

```bash
npm run db:seed
```

### 4. Start Application

```bash
# In one terminal
npm run dev
```

### 5. Run Integration Tests

```bash
# In another terminal
npm run test:integration
```

## Running Tests

### Run All Integration Tests

```bash
npm run test:integration
```

### Run Specific Test File

```bash
npx vitest tests/integration/auth.test.ts
```

### Run Tests in Watch Mode

```bash
npx vitest tests/integration --watch
```

### Run Tests with Coverage

```bash
npx vitest tests/integration --coverage
```

## Test Files

- `auth.test.ts` - Authentication endpoints (login, refresh, logout, me)
- `tasks.test.ts` - Tasks CRUD operations
- `equipment.test.ts` - Equipment management
- `materials.test.ts` - Materials inventory
- `zones.test.ts` - Zone management

## Test Structure

Each test file follows this pattern:

```typescript
import { describe, it, expect, beforeAll } from 'vitest'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

describe('API Integration', () => {
  let accessToken: string

  beforeAll(async () => {
    // Login to get authentication token
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@golfclub.de',
        password: 'admin123',
      }),
    })
    const data = await response.json()
    accessToken = data.data.accessToken
  })

  describe('GET /api/endpoint', () => {
    it('should do something', async () => {
      const response = await fetch(`${API_URL}/api/endpoint`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })
})
```

## Environment Variables

Set these environment variables for testing:

```bash
# .env.test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/golf_greenkeeper_test"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="test-jwt-secret"
JWT_REFRESH_SECRET="test-jwt-refresh-secret"
NEXTAUTH_SECRET="test-nextauth-secret"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Test Data

Integration tests use the seeded data from `prisma/seed.ts`:

**Users:**
- Admin: `admin@golfclub.de` / `admin123`
- Head Greenkeeper: `head@golfclub.de` / `head123`
- Greenkeeper: `greenkeeper@golfclub.de` / `greenkeeper123`
- Greenkeeper 2: `anna@golfclub.de` / `greenkeeper123`

**Data:**
- 18 holes with zones (greens, tees, fairways)
- 10 equipment items
- 10 materials
- 6 sensors
- 6 tasks
- 7 days of weather data

## CI/CD Integration

Integration tests are run in GitHub Actions CI pipeline:

```yaml
test:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:16-alpine
      env:
        POSTGRES_DB: golf_greenkeeper_test
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
      ports:
        - 5432:5432
    redis:
      image: redis:7-alpine
      ports:
        - 6379:6379

  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx prisma migrate deploy
    - run: npm run db:seed
    - run: npm run dev &
    - run: npm run test:integration
```

## Best Practices

### 1. Use Seeded Data

Rely on seeded data instead of creating new data in tests when possible.

### 2. Clean Up After Tests

If you create test data, clean it up in `afterAll`:

```typescript
afterAll(async () => {
  // Clean up test data
  await fetch(`${API_URL}/api/tasks/${testTaskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
})
```

### 3. Test Both Success and Error Cases

Always test:
- ✅ Happy path (valid data)
- ❌ Invalid data
- ❌ Missing authentication
- ❌ Missing required fields
- ❌ Invalid IDs

### 4. Check Response Structure

Verify:
- HTTP status codes
- Response body structure
- Data types
- Required fields

### 5. Use Descriptive Test Names

```typescript
// Good
it('should return 404 when task does not exist')

// Bad
it('test task endpoint')
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL
```

### Tests Timing Out

Increase timeout in test file:

```typescript
it('should do something', async () => {
  // ...
}, 10000) // 10 second timeout
```

### Authentication Errors

Ensure database is seeded:

```bash
npm run db:seed
```

## Adding New Tests

1. Create test file: `tests/integration/endpoint.test.ts`
2. Import dependencies
3. Set up authentication in `beforeAll`
4. Write test cases for each endpoint
5. Test success and error cases
6. Clean up test data in `afterAll`

Example:

```typescript
describe('New Endpoint', () => {
  let accessToken: string
  let testId: string

  beforeAll(async () => {
    // Login
  })

  afterAll(async () => {
    // Cleanup
  })

  describe('GET /api/endpoint', () => {
    it('should work', async () => {
      // Test
    })
  })
})
```
