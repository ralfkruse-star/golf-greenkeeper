# Developer Guide

Comprehensive guide for developers working on the Golf Greenkeeper Management System.

---

## 🎯 Getting Started

### Development Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-username/golf-greenkeeper.git
   cd golf-greenkeeper
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Setup Database**
   ```bash
   # Start PostgreSQL (if using Docker)
   docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14

   # Run migrations
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 🏗️ Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (API Routes, UI Components)          │
├─────────────────────────────────────────┤
│         Application Layer               │
│        (Services, Use Cases)            │
├─────────────────────────────────────────┤
│           Domain Layer                  │
│    (Entities, Business Rules)           │
├─────────────────────────────────────────┤
│       Infrastructure Layer              │
│  (Repositories, External APIs)          │
└─────────────────────────────────────────┘
```

### Module Structure (DDD)

Each domain module follows this structure:

```
src/modules/tasks/
├── domain/
│   ├── task.entity.ts          # Domain entity
│   ├── task-status.enum.ts     # Value objects
│   └── errors.ts                # Domain errors
├── application/
│   └── task.service.ts          # Business logic
├── infrastructure/
│   └── task.repository.ts       # Data access
└── tests/
    └── task.entity.test.ts      # Unit tests
```

---

## 🧪 Test-Driven Development (TDD)

### TDD Workflow

1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

### Example TDD Session

```typescript
// 1. Write test first (Red)
describe('Task Entity', () => {
  it('should start a task', () => {
    const task = new Task({ title: 'Test', status: 'TODO' })
    task.start('user-id')
    expect(task.status).toBe('IN_PROGRESS')
  })
})

// 2. Implement feature (Green)
class Task {
  start(userId: string) {
    this.props.status = 'IN_PROGRESS'
    this.props.actualStart = new Date()
  }
}

// 3. Refactor if needed
class Task {
  start(userId: string) {
    if (this.props.status === 'COMPLETED') {
      throw new BusinessRuleViolationError('Cannot start completed task')
    }
    this.props.status = TaskStatus.IN_PROGRESS
    this.props.actualStart = new Date()
    this.addDomainEvent(new TaskStartedEvent(this.id, userId))
  }
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test task.entity.test.ts

# Run tests in watch mode
npm test --watch

# Generate coverage report
npm run test:coverage
```

---

## 📝 Coding Standards

### TypeScript

- Use strict mode
- Prefer `interface` over `type` for object shapes
- Use `type` for unions and intersections
- Always specify return types for functions
- Use `const` assertions where appropriate

### Naming Conventions

```typescript
// Classes: PascalCase
class TaskService {}

// Interfaces: PascalCase with 'I' prefix (optional)
interface ITaskRepository {}

// Enums: PascalCase
enum TaskStatus {}

// Functions/Methods: camelCase
function createTask() {}

// Constants: UPPER_SNAKE_CASE
const MAX_TASKS = 100

// Files: kebab-case
// task-service.ts
// task.entity.ts
```

### File Organization

```
src/
├── app/                   # Next.js App Router
│   ├── (dashboard)/       # Route groups
│   └── api/               # API routes
├── modules/               # Domain modules (DDD)
│   └── {domain}/
│       ├── domain/
│       ├── application/
│       └── infrastructure/
├── lib/                   # Shared utilities
│   ├── auth/
│   ├── validation/
│   └── errors/
├── types/                 # Global TypeScript types
└── config/                # Configuration files
```

---

## 🔧 Common Tasks

### Adding a New Domain Module

1. **Create Module Structure**
   ```bash
   mkdir -p src/modules/new-module/{domain,application,infrastructure}
   ```

2. **Create Domain Entity**
   ```typescript
   // src/modules/new-module/domain/entity.ts
   export class NewEntity {
     constructor(private readonly props: NewEntityProps) {}

     // Business logic methods
   }
   ```

3. **Create Repository Interface**
   ```typescript
   // src/modules/new-module/domain/repository.interface.ts
   export interface INewRepository {
     findById(id: string): Promise<NewEntity | null>
     save(entity: NewEntity): Promise<void>
   }
   ```

4. **Implement Repository**
   ```typescript
   // src/modules/new-module/infrastructure/repository.ts
   export class NewRepository implements INewRepository {
     // Implementation using Prisma
   }
   ```

5. **Create Service**
   ```typescript
   // src/modules/new-module/application/service.ts
   export class NewService {
     constructor(private repository: INewRepository) {}

     // Use cases
   }
   ```

6. **Write Tests**
   ```typescript
   // tests/unit/new-module/entity.test.ts
   describe('New Entity', () => {
     it('should...', () => {
       // Test business logic
     })
   })
   ```

### Adding a New API Endpoint

1. **Create Route File**
   ```typescript
   // src/app/api/new-endpoint/route.ts
   import { NextRequest, NextResponse } from 'next/server'

   export async function GET(request: NextRequest) {
     // Implementation
     return NextResponse.json({ success: true, data: {} })
   }
   ```

2. **Add Validation**
   ```typescript
   // src/lib/validation/index.ts
   export const newSchema = z.object({
     field: z.string().min(1),
   })
   ```

3. **Add Authentication** (if needed)
   ```typescript
   const user = await authenticateRequest(request)
   if (!user) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }
   ```

4. **Test API Endpoint**
   ```bash
   curl -X GET http://localhost:3000/api/new-endpoint \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Adding a New UI Component

1. **Create Component**
   ```typescript
   // src/components/NewComponent.tsx
   export function NewComponent({ prop }: Props) {
     return <div>{prop}</div>
   }
   ```

2. **Write Component Tests**
   ```typescript
   // tests/ui/new-component.test.tsx
   import { render, screen } from '@testing-library/react'
   import { NewComponent } from '@/components/NewComponent'

   describe('NewComponent', () => {
     it('renders correctly', () => {
       render(<NewComponent prop="test" />)
       expect(screen.getByText('test')).toBeInTheDocument()
     })
   })
   ```

---

## 🐛 Debugging

### Backend Debugging

```typescript
// Add debug logs
console.log('[DEBUG] Task created:', task)

// Use debugger
debugger

// Inspect Prisma queries
// Add to prisma schema:
// log = ["query", "info", "warn", "error"]
```

### Frontend Debugging

```typescript
// React DevTools
// Install extension: React Developer Tools

// Log render cycles
useEffect(() => {
  console.log('[RENDER] Component rendered with:', props)
}, [props])

// Debug state
console.log('[STATE]', useState)
```

### Testing Debugging

```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Debug specific test
npm test -- --inspect-brk task.test.ts
```

---

## 📦 Dependencies

### Adding New Dependencies

```bash
# Production dependency
npm install package-name

# Development dependency
npm install --save-dev package-name

# With legacy peer deps (if needed)
npm install package-name --legacy-peer-deps
```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm update package-name
```

---

## 🔐 Security Best Practices

1. **Never commit secrets** (.env files)
2. **Validate all input** (use Zod schemas)
3. **Sanitize user data** before database operations
4. **Use parameterized queries** (Prisma handles this)
5. **Implement rate limiting** for API endpoints
6. **Hash passwords** with Argon2 (never plain text)
7. **Use HTTPS** in production
8. **Set secure headers** (CORS, CSP, etc.)

---

## 🚀 Deployment

### Production Build

```bash
# Build application
npm run build

# Start production server
npm start
```

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_ACCESS_SECRET="production-secret"
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 📈 Performance Optimization

### Database

- Use indexes on frequently queried fields
- Implement pagination for large datasets
- Use database connection pooling
- Cache frequent queries with Redis

### API

- Implement response caching
- Use compression middleware
- Optimize bundle size
- Lazy load components

### Frontend

- Use React.memo for expensive components
- Implement code splitting
- Optimize images (next/image)
- Use SSR/SSG where appropriate

---

## 🔍 Troubleshooting

### Common Issues

**Issue**: Tests failing with "Module not found"
```bash
# Solution: Check tsconfig paths
# Ensure vitest.config.ts has correct aliases
```

**Issue**: Prisma client not updated
```bash
# Solution: Regenerate Prisma client
npx prisma generate
```

**Issue**: Port 3000 already in use
```bash
# Solution: Kill process or use different port
lsof -ti:3000 | xargs kill
# Or
PORT=3001 npm run dev
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vitest Documentation](https://vitest.dev)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 🤝 Need Help?

- Check existing issues on GitHub
- Ask in team Slack channel
- Review code examples in the codebase
- Pair program with team members

---

**Happy Coding! 🎉**
