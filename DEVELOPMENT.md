# Development Guide

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis (optional, for caching)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd golf-greenkeeper
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required environment variables:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/golf_greenkeeper?schema=public"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# JWT Secrets (IMPORTANT: Change these in production!)
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# App
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Development Workflow

### TDD Approach

This project follows Test-Driven Development:

1. **Write a failing test**
   ```bash
   npm run test:watch
   ```

2. **Implement the minimum code to pass**

3. **Refactor while keeping tests green**

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (for TDD)
npm run test:watch

# With coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# All checks (before committing)
npm run lint && npm run type-check && npm test
```

---

## Project Structure

```
golf-greenkeeper/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── tasks/        # Task endpoints
│   │   │   ├── locations/    # Location endpoints
│   │   │   ├── equipment/    # Equipment endpoints
│   │   │   ├── auth/         # Auth endpoints
│   │   │   └── qr/           # QR workflow endpoints
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── modules/               # Domain modules
│   │   ├── tasks/
│   │   │   ├── services/     # Business logic
│   │   │   ├── types/        # TypeScript types
│   │   │   └── validators/   # Zod schemas
│   │   ├── locations/
│   │   ├── equipment/
│   │   ├── materials/
│   │   └── auth/
│   ├── lib/                   # Shared utilities
│   │   ├── db.ts             # Prisma client
│   │   ├── redis.ts          # Redis client
│   │   ├── auth/             # Auth utilities
│   │   └── config/           # Configuration
│   └── types/                 # Global types
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Seed script
│   └── migrations/           # DB migrations
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── helpers/              # Test utilities
└── .github/
    └── workflows/            # CI/CD pipelines
```

---

## Database Management

### Migrations

```bash
# Create a new migration
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Reset database (development only!)
npx prisma migrate reset
```

### Prisma Studio

Visual database browser:

```bash
npm run db:studio
```

Opens at `http://localhost:5555`.

### Seeding

Reset and re-seed the database:

```bash
npm run db:seed
```

**Default seed users:**
- Admin: `admin@golfclub-siek.de` / `Admin123!`
- Manager: `manager@golfclub-siek.de` / `Manager123!`
- Head Greenkeeper: `head@golfclub-siek.de` / `Head123!`
- Greenkeeper: `greenkeeper1@golfclub-siek.de` / `Green123!`

---

## API Development

### Creating a New Module

1. **Create module structure:**
   ```bash
   mkdir -p src/modules/my-module/{services,types,validators}
   ```

2. **Define types** (`src/modules/my-module/types/index.ts`)

3. **Create validators** (`src/modules/my-module/validators/index.ts`)

4. **Write tests** (`tests/unit/my-module-service.test.ts`)

5. **Implement service** (`src/modules/my-module/services/my-service.ts`)

6. **Create API routes** (`src/app/api/my-module/route.ts`)

### Adding a New API Endpoint

1. Create route file:
   ```typescript
   // src/app/api/my-endpoint/route.ts
   import { NextRequest } from 'next/server'
   import { successResponse, errorResponse } from '@/lib/api-helpers'

   export async function GET(request: NextRequest) {
     try {
       // Your logic here
       return successResponse({ message: 'Success' })
     } catch (error) {
       return errorResponse(error)
     }
   }
   ```

2. Add validation with Zod:
   ```typescript
   const schema = z.object({
     field: z.string().min(1)
   })
   const validated = schema.parse(body)
   ```

3. Use service layer for business logic

---

## Testing Strategy

### Unit Tests

Test pure business logic in services:

```typescript
describe('MyService', () => {
  let service: MyService
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = {
      myModel: {
        create: vi.fn(),
        findMany: vi.fn(),
      }
    }
    service = new MyService(mockPrisma)
  })

  it('should create an item', async () => {
    // Test implementation
  })
})
```

### Integration Tests

Test full API endpoints with real database:

```typescript
describe('POST /api/tasks', () => {
  it('should create a task', async () => {
    const response = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Task'
      })
    })

    expect(response.status).toBe(201)
  })
})
```

---

## Common Tasks

### Add a New User Role

1. Update Prisma schema:
   ```prisma
   enum UserRole {
     // ... existing roles
     NEW_ROLE
   }
   ```

2. Run migration:
   ```bash
   npm run db:migrate
   ```

3. Update role checks in middleware

### Implement New Task Status

1. Update `TaskStatus` enum in `src/modules/tasks/types/index.ts`

2. Update `VALID_STATUS_TRANSITIONS` mapping

3. Add tests for new transition rules

4. Update API documentation

---

## Debugging

### Enable Prisma Query Logging

In `.env`:
```env
DATABASE_URL="postgresql://...?schema=public&log=query"
```

Or in code:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
})
```

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

---

## Performance Tips

### Database Query Optimization

1. Use `include` instead of multiple queries:
   ```typescript
   const task = await prisma.task.findUnique({
     where: { id },
     include: {
       location: true,
       assignedTo: true
     }
   })
   ```

2. Use indexes for frequently queried fields (already defined in schema)

3. Paginate large result sets

### Caching with Redis

```typescript
import { redis } from '@/lib/redis'

// Set cache
await redis.set('key', JSON.stringify(data), 'EX', 3600)

// Get cache
const cached = await redis.get('key')
```

---

## Deployment

See `.github/workflows/deploy.yml` for CI/CD pipeline.

### Environment Variables (Production)

Make sure to set in your hosting platform:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET` (strong random string!)
- `JWT_REFRESH_SECRET` (strong random string!)
- `NEXT_PUBLIC_API_URL`

### Database Migrations

```bash
# Production migration
npm run db:migrate:deploy
```

---

## Contributing

1. Create a feature branch
2. Write tests first (TDD)
3. Implement feature
4. Ensure all tests pass
5. Create pull request

### Commit Message Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Refactor code
chore: Update dependencies
```
